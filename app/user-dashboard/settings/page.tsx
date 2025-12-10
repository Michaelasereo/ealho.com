"use client";

import { redirect } from "next/navigation";

export default function UserSettingsPage() {
  redirect("/user-dashboard/settings/profile");
}
