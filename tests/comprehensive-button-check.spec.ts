import { test, expect } from '@playwright/test';

test.describe('Comprehensive Button Action Detection', () => {
  test('verify core navigation and modal triggers', async ({ page }) => {
    // 1. Dashboard
    await page.goto('http://localhost:3000');
    console.log('Dashboard loaded');
    
    // Check Dashboard Quick Actions
    // Try to find the link to /gages
    const inventoryBtn = page.locator('a[href="/gages"]').first();
    await expect(inventoryBtn).toBeVisible();
    console.log('Dashboard Inventory button visible');
    
    // 2. Gage Inventory List
    await page.goto('http://localhost:3000/gages');
    console.log('Inventory page loaded');
    
    // Add Instrument Button
    // Looking for the button that opens the add modal
    const addGageBtn = page.locator('button').filter({ has: page.locator('svg.lucide-plus') }).first();
    await expect(addGageBtn).toBeVisible();
    await addGageBtn.click();
    console.log('Add Gage Modal opened');
    
    // Verify Modal content (e.g., looking for "Asset ID" or "管理編號")
    await expect(page.locator('h3').filter({ hasText: /新增|Add/ })).toBeVisible();
    await page.locator('header button').filter({ has: page.locator('svg.lucide-x') }).click();
    await expect(page.locator('h3').filter({ hasText: /新增|Add/ })).not.toBeVisible();
    console.log('Add Gage Modal closed');
    
    // 3. Gage Detail Page
    // Navigate to the first gage's detail page
    // Wait for the table to load
    await page.waitForSelector('table tbody tr', { state: 'visible' });
    const firstGageRow = page.locator('table tbody tr').first();
    
    // Get gageId from the ID cell
    const gageIdCell = firstGageRow.locator('td.font-mono').first();
    const gageId = (await gageIdCell.innerText()).trim();
    console.log(`Found Gage ID: ${gageId}`);
    
    // Find the detail link (ExternalLink icon)
    const detailLink = firstGageRow.locator('a[href*="/gages/"]').first();
    console.log(`Clicking detail link for ${gageId}`);
    await detailLink.click();
    
    // Wait for navigation
    await page.waitForURL(new RegExp(`/gages/.*`));
    console.log('Navigated to detail page');
    
    // Edit Button (Gear Icon)
    // Looking for a button in the header with a Settings icon
    const editBtn = page.locator('header button').filter({ has: page.locator('svg') }).first();
    await expect(editBtn).toBeVisible();
    await editBtn.click();
    console.log('Edit Modal opened');
    await page.locator('header button').filter({ has: page.locator('svg.lucide-x') }).click();
    console.log('Edit Modal closed');
    
    // Start Calibration Button
    // Looking for a button with text "校正" or "Calibration"
    const startCalBtn = page.locator('button').filter({ hasText: /校正|Calibration/ }).first();
    await expect(startCalBtn).toBeVisible();
    await startCalBtn.click();
    console.log('Calibration Modal opened');
    await page.locator('header button').filter({ has: page.locator('svg.lucide-x') }).click();
    console.log('Calibration Modal closed');
    
    // 4. Standards Management
    await page.goto('http://localhost:3000/settings/standards');
    console.log('Standards page loaded');
    
    const createStdBtn = page.locator('button').filter({ hasText: /建立|Create/ }).first();
    await expect(createStdBtn).toBeVisible();
    await createStdBtn.click();
    console.log('Standard Editor Modal opened');
    await page.keyboard.press('Escape');
    
    // 5. Vendors Page
    await page.goto('http://localhost:3000/vendors');
    console.log('Vendors page loaded');
    
    const addVendorBtn = page.locator('a[href="/vendors/new"]');
    await expect(addVendorBtn).toBeVisible();
    console.log('Add Vendor button detected');
  });
});
