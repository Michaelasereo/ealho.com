"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

const seedUsers = [
  { id: "u1", name: "Amaka Bello", email: "amaka@example.com", status: "active", created: "Mar 3" },
  { id: "u2", name: "Tom Ade", email: "tom@example.com", status: "inactive", created: "Feb 18" },
  { id: "u3", name: "Lisa John", email: "lisa@example.com", status: "active", created: "Jan 28" },
];

export default function AdminUsersPage() {
  const [users, setUsers] = useState(seedUsers);

  const handleDelete = (id: string) => {
    setUsers((prev) => prev.filter((u) => u.id !== id));
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-white">Users</h1>
        <p className="text-white/60">Manage patients and their access.</p>
      </div>

      <Card className="bg-[#111] border-[#1f1f1f]">
        <CardHeader>
          <CardTitle className="text-white">Directory</CardTitle>
        </CardHeader>
        <CardContent className="divide-y divide-[#1f1f1f]">
          {users.length === 0 ? (
            <div className="py-4 text-sm text-white/60">No users.</div>
          ) : (
            users.map((user) => (
              <div
                key={user.id}
                className="py-3 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 text-sm text-white/80"
              >
                <div>
                  <div className="font-medium text-white">{user.name}</div>
                  <div className="text-white/60">{user.email}</div>
                </div>
                <div className="flex items-center gap-3">
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-medium ${
                      user.status === "active"
                        ? "bg-emerald-500/20 text-emerald-200"
                        : "bg-amber-500/20 text-amber-200"
                    }`}
                  >
                    {user.status}
                  </span>
                  <span className="text-white/50">Joined {user.created}</span>
                  <Button
                    size="sm"
                    variant="outline"
                    className="border-white/20 text-white hover:bg-white/10"
                    onClick={() => handleDelete(user.id)}
                  >
                    Delete
                  </Button>
                </div>
              </div>
            ))
          )}
        </CardContent>
      </Card>
    </div>
  );
}
