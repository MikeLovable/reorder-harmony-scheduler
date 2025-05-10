
import React, { useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { useManualSchedules } from '@/hooks/useManualSchedules';

const ManualOutputTab: React.FC = () => {
  const { schedules } = useManualSchedules();
  const [jsonOutput, setJsonOutput] = React.useState('');

  useEffect(() => {
    if (schedules && schedules.length > 0) {
      setJsonOutput(JSON.stringify(schedules, null, 2));
    } else {
      setJsonOutput('No manual order schedules available. Please create and edit some in the Manual tab.');
    }
  }, [schedules]);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Human In the Loop Order Schedule</CardTitle>
      </CardHeader>
      <CardContent>
        <Textarea
          value={jsonOutput}
          readOnly
          className="min-h-[600px] font-mono text-sm"
        />
      </CardContent>
    </Card>
  );
};

export default ManualOutputTab;
