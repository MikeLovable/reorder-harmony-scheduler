
import React from 'react';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import BatchTab from './tabs/BatchTab';
import DataConfigTab from './tabs/DataConfigTab';
import ManualTab from './tabs/ManualTab';
import ManualOutputTab from './tabs/ManualOutputTab';

interface TabsComponentProps {
  apiUrl: string;
  setApiUrl: (url: string) => void;
}

const TabsComponent: React.FC<TabsComponentProps> = ({ apiUrl, setApiUrl }) => {
  return (
    <Tabs defaultValue="Manual" className="w-full">
      <TabsList className="grid grid-cols-4 mb-4">
        <TabsTrigger value="DataConfig">Data/Config</TabsTrigger>
        <TabsTrigger value="Batch">Batch</TabsTrigger>
        <TabsTrigger value="Manual">Manual</TabsTrigger>
        <TabsTrigger value="ManualOutput">ManualOutput</TabsTrigger>
      </TabsList>
      
      <TabsContent value="DataConfig">
        <DataConfigTab />
      </TabsContent>
      
      <TabsContent value="Batch">
        <BatchTab apiUrl={apiUrl} setApiUrl={setApiUrl} />
      </TabsContent>
      
      <TabsContent value="Manual">
        <ManualTab apiUrl={apiUrl} />
      </TabsContent>
      
      <TabsContent value="ManualOutput">
        <ManualOutputTab />
      </TabsContent>
    </Tabs>
  );
};

export default TabsComponent;
