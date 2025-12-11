import Header from "@/components/Header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const TermsOfService = () => {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="container mx-auto px-4 py-12 sm:py-16 lg:py-20">
        <Card className="max-w-4xl mx-auto">
          <CardHeader>
            <CardTitle className="text-3xl font-bold text-center mb-4">Terms of Service</CardTitle>
          </CardHeader>
          <CardContent className="prose dark:prose-invert max-w-none space-y-6">
            <p className="text-muted-foreground">Last updated: {new Date().toLocaleDateString()}</p>
            
            <section>
              <h3 className="text-xl font-semibold mb-2">1. Agreement to Terms</h3>
              <p>
                By accessing our website, you agree to be bound by these Terms of Service and to comply with all applicable laws and regulations. 
                If you do not agree with these terms, you are prohibited from using or accessing this site or using any other services provided by ResonanceX Classes.
              </p>
            </section>

            <section>
              <h3 className="text-xl font-semibold mb-2">2. Use License</h3>
              <p>
                Permission is granted to temporarily download one copy of the materials (information or software) on ResonanceX Classes' website for personal, 
                non-commercial transitory viewing only. This is the grant of a license, not a transfer of title, and under this license you may not:
              </p>
              <ul className="list-disc pl-6 mt-2 space-y-1">
                <li>modify or copy the materials;</li>
                <li>use the materials for any commercial purpose, or for any public display (commercial or non-commercial);</li>
                <li>attempt to decompile or reverse engineer any software contained on ResonanceX Classes' website;</li>
                <li>remove any copyright or other proprietary notations from the materials; or</li>
                <li>transfer the materials to another person or "mirror" the materials on any other server.</li>
              </ul>
            </section>

            <section>
              <h3 className="text-xl font-semibold mb-2">3. Disclaimer</h3>
              <p>
                The materials on ResonanceX Classes' website are provided on an 'as is' basis. ResonanceX Classes makes no warranties, expressed or implied, 
                and hereby disclaims and negates all other warranties including, without limitation, implied warranties or conditions of merchantability, 
                fitness for a particular purpose, or non-infringement of intellectual property or other violation of rights.
              </p>
            </section>

            <section>
              <h3 className="text-xl font-semibold mb-2">4. Limitations</h3>
              <p>
                In no event shall ResonanceX Classes or its suppliers be liable for any damages (including, without limitation, damages for loss of data or profit, 
                or due to business interruption) arising out of the use or inability to use the materials on ResonanceX Classes' website, even if ResonanceX Classes 
                or a ResonanceX Classes authorized representative has been notified orally or in writing of the possibility of such damage.
              </p>
            </section>

            <section>
              <h3 className="text-xl font-semibold mb-2">5. Governing Law</h3>
              <p>
                These terms and conditions are governed by and construed in accordance with the laws of Bangladesh and you irrevocably submit to the exclusive 
                jurisdiction of the courts in that State or location.
              </p>
            </section>

            <section>
              <h3 className="text-xl font-semibold mb-2">6. Contact Information</h3>
              <p>
                Questions about the Terms of Service should be sent to us at support@resonancex.com.
              </p>
            </section>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default TermsOfService;
