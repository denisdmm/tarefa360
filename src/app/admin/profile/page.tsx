
"use client";

import ProfilePage from "@/app/shared/profile/page";
import { useDataContext } from "@/context/DataContext";
import * as React from "react";

export default function AdminProfile() {
    const { loggedInUser } = useDataContext();
    
    if (!loggedInUser) {
        // You can show a loading state or redirect
        return <div>Carregando perfil...</div>;
    }
    
    return <ProfilePage loggedInUserId={loggedInUser.id} />;
}
