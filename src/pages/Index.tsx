
import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import TabsComponent from '@/components/TabsComponent';
import { ManualSchedulesProvider } from '@/hooks/useManualSchedules';

// Helper function to get cookie
const getCookie = (name: string): string => {
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) return parts.pop()?.split(';').shift() || '';
  return '';
};

// Helper function to set cookie
const setCookie = (name: string, value: string, days = 365): void => {
  const date = new Date();
  date.setTime(date.getTime() + (days * 24 * 60 * 60 * 1000));
  const expires = `expires=${date.toUTCString()}`;
  document.cookie = `${name}=${value}; ${expires}; path=/`;
};

const Index = () => {
  const [apiUrl, setApiUrl] = useState<string>("");
  
  // Load API URL from cookie on component mount
  useEffect(() => {
    const savedApiUrl = getCookie('apiUrl');
    setApiUrl(savedApiUrl || "https://your-api-gateway-url.execute-api.us-east-1.amazonaws.com/prod");
  }, []);
  
  // Save API URL to cookie whenever it changes
  useEffect(() => {
    if (apiUrl) {
      setCookie('apiUrl', apiUrl);
    }
  }, [apiUrl]);

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-[95%] mx-auto">
        <Card className="mb-8">
          <CardHeader>
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div>
                <CardTitle className="text-2xl font-bold text-gray-800">
                  Reorder Algorithm Scheduler
                </CardTitle>
                <CardDescription className="text-gray-600 mt-1">
                  Optimizing inventory levels for manufacturing parts
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          
          <CardContent>
            <ManualSchedulesProvider>
              <TabsComponent apiUrl={apiUrl} setApiUrl={setApiUrl} />
            </ManualSchedulesProvider>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Index;
