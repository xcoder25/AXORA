'use client';

import { useUser, useDoc } from '@/firebase';
import { SchoolLoader } from '@/components/school-loader';

export default function DashboardLoading() {
  const { user } = useUser();
  const { data: profile, loading: profileLoading } = useDoc(
    user ? `users/${user.uid}` : null
  );

  const { data: school, loading: schoolLoading } = useDoc(
    !profileLoading && profile?.schoolId ? `schools/${profile.schoolId}` : null
  );

  return (
    <SchoolLoader
      logoUrl={school?.logoUrl}
      primaryColor={school?.branding?.primaryColor}
      secondaryColor={school?.branding?.secondaryColor}
      title="Preparing your portal"
      subtitle={school?.name || 'Institution'}
    />
  );
}

