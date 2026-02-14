const fetchProfile = async (userId: string, email: string) => {
    console.log('🔍 Starting fetchProfile for:', email);
    try {
        // 0. IMMEDIATE Master Admin Check
        const masterAdmins = ['jorge@dermakorswiss.com', 'torresjorge2812@gmail.com', 'jorgetorres2812@gmail.com'];
        if (email && masterAdmins.includes(email.toLowerCase())) {
            console.log('✅ Master admin detected');
            setUser({
                id: userId,
                name: 'Jorge Torres (Admin)',
                email: email,
                role: 'ADMIN',
                status: 'active',
                tier: UserTier.PREMIUM,
                currentSpend: 0,
                monthlyGoal: 0
            });
            return;
        }

        console.log('📊 Querying partner_users table...');
        const { data, error } = await supabase
            .from('partner_users')
            .select('*')
            .eq('id', userId)
            .single();

        console.log('Partner query result:', { data, error });

        if (error) {
            console.log('⚠️ Not in partner_users, checking profiles...');
            const { data: adminData, error: adminError } = await supabase
                .from('profiles')
                .select('*')
                .eq('id', userId)
                .single();

            console.log('Profiles query result:', { adminData, adminError });

            if (adminData && !adminError) {
                const displayName = adminData.full_name ||
                    `${adminData.first_name || ''} ${adminData.last_name || ''}`.trim() ||
                    'Admin';

                const isAdminRole = ['admin', 'directeur', 'manager', 'vendeur'].includes(adminData.role?.toLowerCase());

                if (isAdminRole) {
                    console.log('✅ Admin role confirmed');
                    setUser({
                        id: userId,
                        name: displayName,
                        email: email,
                        role: 'ADMIN',
                        status: 'active',
                        tier: UserTier.PREMIUM,
                        currentSpend: 0,
                        monthlyGoal: 0
                    });
                } else {
                    console.error('❌ No authorized CRM role');
                    setUser(null);
                }
            } else {
                console.error('❌ Profile not found in either table');
                setUser(null);
            }
        } else {
            console.log('✅ Partner user found');
            setUser({
                id: data.id,
                name: data.contact_name || 'Socio',
                instituteName: data.company_name,
                email: data.email,
                role: 'PARTENAIRE',
                status: data.status || 'pending',
                tier: (data.tier as UserTier) || UserTier.STANDARD,
                currentSpend: 0,
                monthlyGoal: 800
            });
        }
    } catch (error) {
        console.error('💥 CRITICAL ERROR:', error);
        setUser(null);
    } finally {
        console.log('🏁 Setting isLoading to false');
        setIsLoading(false);
    }
};