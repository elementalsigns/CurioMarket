import { Card, CardContent } from "@/components/ui/card";
import { AlertCircle } from "lucide-react";
import Footer from "@/components/layout/footer";

export default function NotFound() {
  return (
    <div className="min-h-screen w-full flex flex-col bg-zinc-950">
      <div className="flex-1 flex items-center justify-center">
        <Card className="w-full max-w-md mx-4 bg-zinc-900 border-zinc-800">
          <CardContent className="pt-6">
            <div className="flex mb-4 gap-2">
              <AlertCircle className="h-8 w-8 text-red-500" />
              <h1 className="text-2xl font-bold text-white">404 Page Not Found</h1>
            </div>

            <p className="mt-4 text-sm text-zinc-400">
              Did you forget to add the page to the router?
            </p>
          </CardContent>
        </Card>
      </div>
      <Footer />
    </div>
  );
}
