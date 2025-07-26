
"use client";

import ProfilePage from "@/app/shared/profile/page";
import { useDataContext } from "@/context/DataContext";
import * as React from "react";

export default function AppraiseeProfile() {
    const { loggedInUser } = useDataContext();

    if (!loggedInUser) {
        return <div>Carregando perfil...</div>;
    }

    return <ProfilePage loggedInUserId={loggedInUser.id} />;
}
