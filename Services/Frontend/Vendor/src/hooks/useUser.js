import { useAuthContext } from '../context/AuthContext';

// Simple hook to get user data instead of localStorage
const useUser = () => {
  const { user, loading, isAuthenticated, refreshUser } = useAuthContext();

  return {
    userId: user?.id || null,
    storename: user?.storename || null,
    email: user?.email || null,
    phoneNumber: user?.phoneNumber || null,
    status: user?.status || null,
    userType: user?.userType || null,
    gstNumber: user?.gstNumber || null,
    address: user?.address || null,
    pincode: user?.pincode || null,
    hnscode: user?.hnscode || null,
    profile_picture: user?.profile_picture || null,
    user,
    loading,
    isAuthenticated,
    refreshUser
  };
};

export default useUser; 