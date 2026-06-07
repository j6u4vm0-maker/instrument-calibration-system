import { test, expect } from '@playwright/test';

test.describe('KST Internal Calibration Workflow Test', () => {

  test.beforeEach(async ({ page }) => {
    // Start from home page
    await page.goto('http://localhost:3000');
  });

  test('Should complete a full internal calibration data entry flow', async ({ page }) => {
    // 1. Navigate to Gage List
    await page.goto('http://localhost:3000/gages');
    await page.waitForLoadState('networkidle');
    await expect(page.getByRole('table')).toBeVisible({ timeout: 10000 });

    // 2. Click the first gage to go to details - Use multiple locator strategies for robustness
    const firstGageLink = page.locator('a[title*="details"], a[title*="詳情"], a[title*="common.details"]').first();
    await firstGageLink.click({ timeout: 10000 });
    await page.waitForLoadState('networkidle');
    await expect(page).toHaveURL(/\/gages\/.+/, { timeout: 10000 });

    // 3. Open Calibration Modal
    const startCalBtn = page.getByRole('button', { name: /開始校正|Start Calibration/i });
    await startCalBtn.click({ timeout: 10000 });

    // 4. Verify Modal Header and Switch to Internal Report
    await expect(page.getByRole('heading', { name: /開始校正|Start Calibration/i }).last()).toBeVisible({ timeout: 10000 });
    const internalTab = page.getByRole('button', { name: /內部校正|Internal Report/i });
    await internalTab.click();

    // 5. Fill Basic Info
    await page.getByPlaceholder(/Name/).fill('Test Technician');
    
    // 6. Record Environmental Data - Use more specific locators
    const tempInput = page.locator('section:has-text("溫度") input, section:has-text("Temperature") input').first();
    const humidInput = page.locator('section:has-text("濕度") input, section:has-text("Humidity") input').first();
    await tempInput.fill('22');
    await humidInput.fill('45');

    // 7. Test Master Gage Traceability
    const addMasterBtn = page.getByRole('button', { name: /新增標準件|Add Master Gage/i });
    await addMasterBtn.click();
    
    // Check if master gage modal appears
    await expect(page.getByRole('heading', { name: /新增標準件|Add Master Gage/i }).last()).toBeVisible({ timeout: 5000 });
    
    // Select the first available master gage if any
    const firstMaster = page.locator('button:has(div > div.text-sm.font-bold)').first();
    if (await firstMaster.isVisible()) {
      await firstMaster.click();
      await page.getByRole('button', { name: /確認|Confirm/i }).click();
      // Verify it was added to the list (traceability section)
      await expect(page.locator('section').filter({ hasText: /追溯性|Traceability/ }).locator('div.flex-wrap span')).toBeVisible();
    } else {
      await page.getByRole('button', { name: /確認|Confirm/i }).click();
    }

    // 8. Fill Measurement Data
    const actualInput = page.locator('input[required][type="number"]').first();
    const specInput = page.locator('input[required][type="text"]').nth(1);
    const specValue = await specInput.inputValue(); 
    
    // Enter a passing value
    await actualInput.fill(specValue);
    await page.keyboard.press('Tab');
    
    // Verify Pass status - check for emerald background icon
    await expect(page.locator('.bg-emerald-100 .lucide-check-circle2').first()).toBeVisible({ timeout: 5000 });

    // Enter a failing value
    const failingVal = (parseFloat(specValue) + 10).toString();
    await actualInput.fill(failingVal);
    await page.keyboard.press('Tab');
    
    // Verify Fail status - check for red background icon
    await expect(page.locator('.bg-red-100 .lucide-x-circle').first()).toBeVisible({ timeout: 5000 });

    // Fill back a passing value
    await actualInput.fill(specValue);

    // 9. Add Notes
    await page.locator('textarea[name="notes"], textarea').first().fill('Automated Test Run - Internal Cal');

    // 10. Submit as Draft
    await page.getByRole('button', { name: /暫存草稿|Draft/i }).click();

    // 11. Verify modal closed
    await expect(page.getByRole('heading', { name: /開始校正|Start Calibration/i })).not.toBeVisible({ timeout: 15000 });
  });

});
