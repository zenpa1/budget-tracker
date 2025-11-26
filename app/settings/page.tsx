"use client"

import { Sidebar } from "@/components/sidebar"
import { Header } from "@/components/header"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { BudgetProvider } from "@/lib/budget-context"
import { ThemeProvider } from "@/lib/theme-context"
import { AuthProvider, useAuth } from "@/lib/auth-context"
import { AuthGuard } from "@/components/auth-guard"
import { useState } from "react";

function SettingsContent() {
  const { user, updateProfile } = useAuth();
  const [name, setName] = useState(user?.name || "");
  const [email, setEmail] = useState(user?.email || "");

  return (
    <BudgetProvider>
      <div className="min-h-screen bg-background">
        <Sidebar />
        <main className="pl-64">
          <Header title="Settings" description="Configure your budget tracker preferences" />
          <div className="p-6">
            <div className="grid gap-6 lg:grid-cols-2">
              <Card className="bg-card">
                <CardHeader>
                  <CardTitle className="text-foreground">Notification Settings</CardTitle>
                  <CardDescription>Configure when you receive alerts</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <Label className="text-foreground">Budget Exceeded Alerts</Label>
                      <p className="text-sm text-muted-foreground">Get notified when a budget exceeds its limit</p>
                    </div>
                    <Switch defaultChecked />
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <Label className="text-foreground">Warning Threshold Alerts</Label>
                      <p className="text-sm text-muted-foreground">Get notified at 80% budget utilization</p>
                    </div>
                    <Switch defaultChecked />
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <Label className="text-foreground">Email Notifications</Label>
                      <p className="text-sm text-muted-foreground">Receive alerts via email</p>
                    </div>
                    <Switch />
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-card">
                <CardHeader>
                  <CardTitle className="text-foreground">Budget Thresholds</CardTitle>
                  <CardDescription>Set default warning thresholds</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="warning">Warning Threshold (%)</Label>
                    <Input id="warning" type="number" defaultValue="80" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="critical">Critical Threshold (%)</Label>
                    <Input id="critical" type="number" defaultValue="95" />
                  </div>
                  <Button className="w-full">Save Thresholds</Button>
                </CardContent>
              </Card>

              <Card className="bg-card">
                <CardHeader>
                  <CardTitle className="text-foreground">Report Settings</CardTitle>
                  <CardDescription>Configure report generation defaults</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <Label className="text-foreground">Include Charts</Label>
                      <p className="text-sm text-muted-foreground">Add visualizations to reports</p>
                    </div>
                    <Switch defaultChecked />
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <Label className="text-foreground">Include Recommendations</Label>
                      <p className="text-sm text-muted-foreground">Add AI-generated recommendations</p>
                    </div>
                    <Switch defaultChecked />
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-card">
                <CardHeader>
                  <CardTitle className="text-foreground">Profile</CardTitle>
                  <CardDescription>Your account information</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Full Name</Label>
                    <Input 
                      id="name"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="role">Role</Label>
                    <Input
                      id="role"
                      defaultValue={user?.role.replace("_", " ").replace(/\b\w/g, (l) => l.toUpperCase()) || ""}
                      disabled
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="department">Department</Label>
                    <Input id="department" defaultValue={user?.department || ""} disabled />
                  </div>
                  <Button 
                    className="w-full"
                    onClick={async () => {
                      const result = await updateProfile({
                        name,
                        email,
                      });

                      if (!result.success) {
                        alert("Error updating profile: " + result.error);
                      } else {
                        alert("Profile updated successfully!");
                      }
                    }}
                  >
                    Update Profile
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>
        </main>
      </div>
    </BudgetProvider>
  )
}

export default function SettingsPage() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <AuthGuard>
          <SettingsContent />
        </AuthGuard>
      </AuthProvider>
    </ThemeProvider>
  )
}
