import { test, expect } from '@playwright/test';

test.describe('PrecisionTrack Functional Check', () => {
  
  test('Dashboard should load with core statistics', async ({ page }) => {
    await page.goto('/');
    
    // Check for dashboard title (儀表板)
    await expect(page.getByRole('heading', { name: /儀表板|Dashboard/i })).toBeVisible();
    
    // Check for core stats cards
    await expect(page.getByText(/校正達成率|Compliance Rate/i).first()).toBeVisible();
    await expect(page.getByText(/總儀器數量|Total Instruments/i).first()).toBeVisible();
    await expect(page.getByText(/即將到期|Upcoming Calibrations/i).first()).toBeVisible();

  });

  test('Inventory page should list equipment and have CRUD actions', async ({ page }) => {
    await page.goto('/gages');
    
    // Check table headers
    await expect(page.getByText(/管理編號|ID/i).first()).toBeVisible();
    
    // Check if there is at least one row or "No data" message
    const noData = await page.getByText(/找不到符合條件的設備資料|No matching equipment/i).isVisible();
    if (!noData) {
      // If data exists, check for Edit/Delete capability (usually in "Actions" column)
      // Note: We are checking for the presence of elements based on the new CRUD rule
      const actionHeader = page.getByText(/操作|Actions/i);
      await expect(actionHeader).toBeVisible();
    }
  });

  test('Reminders page should be accessible', async ({ page }) => {
    await page.goto('/reminders');
    await expect(page.getByText(/提醒規則|Reminder Rules/i)).toBeVisible();
  });

  test('Reports page should be accessible', async ({ page }) => {
    await page.goto('/reports');
    await expect(page.getByText(/報告|Report/i).first()).toBeVisible();
  });


});
