import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { toast } from "sonner";
import { MapPin } from "lucide-react";

export default function SignUp() {
  const [formData, setFormData] = useState({
    companyName: "",
    adminName: "",
    email: "",
    password: "",
  });
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // 1. Sign up the user in auth
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
        options: {
          data: {
            full_name: formData.adminName,
            company_name: formData.companyName,
          }
        }
      });

      if (authError) throw authError;

      if (!authData.user) {
        throw new Error("No user returned after sign up");
      }

      // If user is created, wait a moment to make sure session is active
      // 2. Create the company
      const { data: company, error: compError } = await supabase
        .from("companies")
        .insert({
          name: formData.companyName,
          email: formData.email,
        })
        .select()
        .single();

      if (compError) {
        throw new Error("Failed to register company: " + compError.message);
      }

      if (company && authData.user) {
        // 3. Create the profile
        const { error: profileError } = await supabase
          .from("profiles")
          .insert({
            id: authData.user.id,
            company_id: company.id,
            role: "admin",
            name: formData.adminName,
            email: formData.email,
          });

        if (profileError) {
           throw new Error("Failed to create admin profile: " + profileError.message);
        }
      }

      toast.success("Successfully registered company!");
      navigate("/");
    } catch (error: any) {
      toast.error(error.message || "An error occurred during sign up");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50/50 p-4">
      <div className="w-full max-w-md space-y-8">
        <div className="flex flex-col items-center justify-center space-y-2">
          <div className="bg-primary/10 p-3 rounded-full">
            <MapPin className="w-8 h-8 text-primary" />
          </div>
          <h1 className="text-3xl font-bold tracking-tight text-gray-900">Sign Up</h1>
          <p className="text-gray-500">Register your company</p>
        </div>

        <Card>
          <form onSubmit={handleSignUp}>
            <CardContent className="pt-6 space-y-4">
              <div className="space-y-2">
                <Label htmlFor="companyName">Company Name</Label>
                <Input
                  id="companyName"
                  placeholder="Smart Logistics Inc."
                  value={formData.companyName}
                  onChange={(e) => setFormData({ ...formData, companyName: e.target.value })}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="adminName">Admin Name</Label>
                <Input
                  id="adminName"
                  placeholder="Jane Doe"
                  value={formData.adminName}
                  onChange={(e) => setFormData({ ...formData, adminName: e.target.value })}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Work Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="jane@logistics.com"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  required
                  minLength={6}
                />
              </div>
            </CardContent>
            <CardFooter className="flex flex-col space-y-4">
              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? "Registering..." : "Register Company"}
              </Button>
              <div className="text-sm text-center text-gray-500">
                Already have an account?{" "}
                <Link to="/signin" className="text-primary hover:underline">
                  Sign in
                </Link>
              </div>
            </CardFooter>
          </form>
        </Card>
      </div>
    </div>
  );
}
