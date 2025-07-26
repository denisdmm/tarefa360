
import ProfilePage from "@/app/shared/profile/page";

export default function AdminProfile() {
    // In a real app, you'd pass the actual logged-in user's ID
    return <ProfilePage loggedInUserId="user-admin-1" />;
}
