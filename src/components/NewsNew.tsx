import React from 'react';
import { FileText, ExternalLink } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';

const News: React.FC = () => {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">News & Market Events</h1>
          <p className="text-gray-600 mt-1">Track economic events and their market impact</p>
        </div>
      </div>

      {/* Main Content - Full Width Airtable */}
      <div className="w-full">
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <FileText className="w-5 h-5 mr-2" />
                <div>
                  <CardTitle>My Events & Trading Calendar</CardTitle>
                  <p className="text-sm text-gray-600">
                    Manage your trading events directly in Airtable
                  </p>
                </div>
              </div>
              
              {/* Forex Factory Link */}
              <Button variant="outline" size="sm" asChild>
                <a href="https://www.forexfactory.com/calendar" target="_blank" rel="noopener noreferrer">
                  <ExternalLink className="w-4 h-4 mr-2" />
                  Forex Factory Calendar
                </a>
              </Button>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            {/* Airtable Embed - Full Width */}
            <div className="border rounded-lg overflow-hidden bg-white">
              <iframe
                src="https://airtable.com/embed/appyEuEsW82AREegt/shrwXZDmDfCf4LrmD?backgroundColor=blue"
                width="100%" 
                height="700" 
                frameBorder="0" 
                allowtransparency="true" 
                marginWidth="0" 
                marginHeight="0"
                title="Trading Events - Airtable"
                className="w-full"
              />

            </div>


          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default News;
