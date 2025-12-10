import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";

export default function AdminSettingsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-white">Settings</h1>
        <p className="text-white/60">Basic platform settings.</p>
      </div>

      <Card className="bg-[#111] border-[#1f1f1f]">
        <CardHeader>
          <CardTitle className="text-white">Branding</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label className="text-white/80" htmlFor="brand-name">
              Brand name
            </Label>
            <Input
              id="brand-name"
              defaultValue="Daiyet"
              className="bg-[#0b0b0b] border-[#1f1f1f] text-white"
            />
          </div>
          <div className="space-y-2">
            <Label className="text-white/80" htmlFor="support-email">
              Support email
            </Label>
            <Input
              id="support-email"
              defaultValue="support@daiyet.com"
              className="bg-[#0b0b0b] border-[#1f1f1f] text-white"
            />
          </div>
          <Button className="bg-white text-black hover:bg-white/90">Save changes</Button>
        </CardContent>
      </Card>
    </div>
  );
}
