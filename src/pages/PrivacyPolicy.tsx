import Header from "@/components/Header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const PrivacyPolicy = () => {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="container mx-auto px-4 py-12 sm:py-16 lg:py-20">
        <Card className="max-w-4xl mx-auto">
          <CardHeader>
            <CardTitle className="text-3xl font-bold text-center mb-4">Privacy Policy</CardTitle>
          </CardHeader>
          <CardContent className="prose dark:prose-invert max-w-none space-y-6">
            <p className="text-muted-foreground">Last updated: {new Date().toLocaleDateString()}</p>
            
            <section>
              <h3 className="text-xl font-semibold mb-2">1. Introduction</h3>
              <p>
                Welcome to ResonanceX Classes. We respect your privacy and are committed to protecting your personal data. 
                This privacy policy will inform you as to how we look after your personal data when you visit our website 
                and tell you about your privacy rights and how the law protects you.
              </p>
            </section>

            <section>
              <h3 className="text-xl font-semibold mb-2">2. Data We Collect</h3>
              <p>
                We may collect, use, store and transfer different kinds of personal data about you which we have grouped together follows:
              </p>
              <ul className="list-disc pl-6 mt-2 space-y-1">
                <li>Identity Data includes first name, last name, username or similar identifier.</li>
                <li>Contact Data includes email address and telephone numbers.</li>
                <li>Technical Data includes internet protocol (IP) address, your login data, browser type and version.</li>
                <li>Usage Data includes information about how you use our website and courses.</li>
              </ul>
            </section>

            <section>
              <h3 className="text-xl font-semibold mb-2">3. How We Use Your Data</h3>
              <p>
                We will only use your personal data when the law allows us to. Most commonly, we will use your personal data in the following circumstances:
              </p>
              <ul className="list-disc pl-6 mt-2 space-y-1">
                <li>To register you as a new customer.</li>
                <li>To process and deliver your order including managing payments, fees and charges.</li>
                <li>To manage our relationship with you which will include notifying you about changes to our terms or privacy policy.</li>
                <li>To enable you to partake in a prize draw, competition or complete a survey.</li>
              </ul>
            </section>

            <section>
              <h3 className="text-xl font-semibold mb-2">4. Data Security</h3>
              <p>
                We have put in place appropriate security measures to prevent your personal data from being accidentally lost, used or accessed in an unauthorized way, altered or disclosed. In addition, we limit access to your personal data to those employees, agents, contractors and other third parties who have a business need to know.
              </p>
            </section>

            <section>
              <h3 className="text-xl font-semibold mb-2">5. Contact Us</h3>
              <p>
                If you have any questions about this privacy policy or our privacy practices, please contact us at:
                <br />
                Email: support@resonancex.com
                <br />
                Address: 594, Donia Bazar Road, Donia (Building Next to Donia Mazar), Dhaka.
              </p>
            </section>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default PrivacyPolicy;
