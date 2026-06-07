import React from 'react';
import { WorkspaceService } from "@/services/workspace-service";
import { FixtureService } from "@/services/fixture-service";
import { VendorService } from "@/services/vendor-service";
import WorkspaceClient from "./WorkspaceClient";
import { getTranslation } from '@/lib/i18n/server-translations';

export default async function WorkspacePage() {
  const { t, language } = await getTranslation();
  
  // Fetch workspace data
  const data = await WorkspaceService.getWorkspaceData();
  const fixtures = await FixtureService.getAllFixtures();
  
  // Fetch vendors for the CalibrationModal
  const vendors = await VendorService.getAllVendors();

  return (
    <div className="p-8 max-w-7xl mx-auto">
      <WorkspaceClient 
        initialData={data} 
        fixtureData={fixtures}
        vendors={vendors} 
        language={language}
      />
    </div>
  );
}
