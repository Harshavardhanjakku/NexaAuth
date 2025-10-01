import { useEffect, useState } from "react";
// import "@fortawesome/fontawesome-free/css/all.min.css";
import "../styles/globals.css";
import Navbar from "../components/Navbar";
import keycloak from "../lib/keycloak";
import { OrganizationProvider } from '../contexts/OrganizationContext';
import API from '../lib/api';

export default function MyApp({ Component, pageProps }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const boot = async () => {
      try {
        // Avoid multiple initialization during Fast Refresh / remounts
        if (typeof window !== 'undefined' && window.__kcInitDone) {
          window.keycloak = keycloak;
          if (keycloak?.token) localStorage.setItem('token', keycloak.token);
          setIsAuthenticated(Boolean(keycloak?.authenticated || keycloak?.token));
          setLoading(false);
          return;
        }

        const authenticated = await keycloak.init({
          onLoad: "check-sso",
          checkLoginIframe: false,
        });

        if (typeof window !== 'undefined') {
          window.__kcInitDone = true;
          window.keycloak = keycloak;
        }

        setIsAuthenticated(authenticated);
        if (authenticated) {
          localStorage.setItem('token', keycloak.token);
          // Log token claims so we can inspect exact IdP payload
          try {
            // Safe stringify without circulars
            console.log('🔍 Keycloak tokenParsed:', JSON.parse(JSON.stringify(keycloak.tokenParsed || {})));
          } catch (_) {}

          // Idempotent provisioning: ensure user/org exist
          try {
            const t = keycloak.tokenParsed || {};
            const keycloakId = t.sub;
            const email = t.email;
            const firstName = t.given_name;
            const lastName = t.family_name;

            if (keycloakId && email) {
              // Avoid re-provisioning repeatedly within the same browser session
              const provisionKey = `provisioned:${keycloakId}`;
              if (!sessionStorage.getItem(provisionKey)) {
                // Check if user exists in your database
                const check = await API.get(`/users?keycloak_id=${encodeURIComponent(keycloakId)}`);
                const exists = Array.isArray(check.data) ? check.data.length > 0 : Boolean(check.data?.id);
                
                if (!exists) {
                  // Create user in your database
                  await API.post('/users', {
                    keycloak_id: keycloakId,
                    email,
                    first_name: firstName,
                    last_name: lastName,
                  });
                }
                
                // Create organization and client in Keycloak
                try {
                  const orgResponse = await fetch('http://localhost:3001/register-google', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                      keycloakId: keycloakId,
                      email: email,
                      firstName: firstName,
                      lastName: lastName,
                      username: keycloak.preferred_username || email.split('@')[0]
                    })
                  });
                  
                  if (orgResponse.ok) {
                    const orgResult = await orgResponse.json();
                    console.log('✅ Organization and client created:', orgResult.data);
                  } else {
                    console.warn('⚠️ Organization creation failed:', await orgResponse.text());
                  }
                } catch (orgError) {
                  console.warn('⚠️ Organization creation failed:', orgError.message);
                }
                
                sessionStorage.setItem(provisionKey, '1');
              }
            } else {
              console.warn('⚠️ Missing keycloak_id or email in token; skipping provisioning');
            }
          } catch (e) {
            console.error('Provisioning failed (will not block UI):', e?.response?.data || e.message);
          }
          keycloak.onTokenExpired = () => {
            keycloak.updateToken(70).then((refreshed) => {
              if (refreshed) {
                localStorage.setItem('token', keycloak.token);
              }
            });
          };
        }
      } catch (err) {
        console.error("Keycloak init failed:", err);
      } finally {
        setLoading(false);
      }
    };
    boot();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-xl">Loading...</div>
      </div>
    );
  }

  return (
    <OrganizationProvider keycloak={keycloak}>
      <div>
        <Navbar keycloak={keycloak} />
        <Component {...pageProps} keycloak={keycloak} />
      </div>
    </OrganizationProvider>
  );
}
