import { test, expect } from '@playwright/test';

/**
 * CRUD Compliance Test
 * Verifies that the system adheres to the CRUD Completeness Rule
 * and Internationalization (i18n) Rule.
 */
test.describe('CRUD Compliance & i18n Verification', () => {

  test.beforeEach(async ({ page }) => {
    // Navigate to the Gage Inventory page
    await page.goto('/gages');
  });

  test('Instrument Management - Full CRUD and i18n Flow', async ({ page }) => {
    // 1. Language Toggle Check (i18n Rule)
    // Check if we can switch to English
    await page.getByRole('button', { name: /偏好設定|Preferences/i }).click();
    await page.getByRole('button', { name: /English/i }).click();
    await page.getByRole('button', { name: /Done/i }).click();
    
    // Verify UI switched to English
    await expect(page.getByRole('heading', { name: /Instrument Inventory/i }).first()).toBeVisible();
    
    // Switch back to Chinese for the rest of the test
    await page.getByRole('button', { name: /Preferences/i }).click();
    await page.getByRole('button', { name: /繁體中文|Chinese/i }).click();
    await page.getByRole('button', { name: /Done/i }).click();
    await expect(page.getByRole('heading', { name: /設備清單/i }).first()).toBeVisible();

    // 2. CREATE (C in CRUD)
    const testGageId = `TEST-${Date.now().toString().slice(-6)}`;
    const testGageName = '測試用儀器';
    
    await page.getByRole('button', { name: /新增設備/i }).click();
    await page.locator('input[name="id"]').fill(testGageId);
    await page.locator('input[name="name"]').fill(testGageName);
    // Fill required or common fields
    await page.locator('input[name="spec"]').fill('TEST-SPEC-001');
    
    // Submit
    await page.getByRole('button', { name: /確認新增/i }).click();
    
    // 3. READ (R in CRUD)
    // Search for the newly created gage
    const searchInput = page.getByPlaceholder(/搜尋設備/i);
    await searchInput.fill(testGageId);
    await page.keyboard.press('Enter');
    
    await expect(page.getByText(testGageId)).toBeVisible();
    await expect(page.getByText(testGageName)).toBeVisible();

    // 4. UPDATE (U in CRUD)
    const updatedName = testGageName + ' (已更新)';
    // Use title from translations (calibration.gage.edit -> 編輯設備)
    await page.locator('button[title="編輯設備"]').first().click();
    await page.locator('input[name="name"]').fill(updatedName);
    // Use label from translations (common.common.save_changes -> 儲存變更)
    await page.getByRole('button', { name: /儲存變更|Save/i }).click();
    
    // Verify update
    await expect(page.getByText(updatedName)).toBeVisible();

    // 5. DELETE (D in CRUD)
    // Use title from translations (calibration.gage.delete -> 刪除設備)
    page.on('dialog', dialog => dialog.accept()); // Handle confirmation dialog
    await page.locator('button[title="刪除設備"]').first().click();
    
    // Verify deletion
    await searchInput.fill(testGageId);
    await page.keyboard.press('Enter');
    // The "No data" message should appear
    await expect(page.getByText(/目前尚無資料|No data/i)).toBeVisible();
  });

  test('Organization Management - Full CRUD for Location', async ({ page }) => {
    // Navigate to Data Management (Organization)
    await page.goto('/data-management');
    
    // Switch to Location tab if not already active
    const locationTab = page.getByRole('button', { name: /廠區|Location/i });
    await locationTab.click();

    // Create a temporary location
    const tempLocationName = `LOC-${Date.now().toString().slice(-4)}`;
    await page.getByRole('button', { name: /新增|Add/i }).click();
    await page.locator('input[placeholder*="廠區名稱"], input[placeholder*="Location Name"]').fill(tempLocationName);
    await page.getByRole('button', { name: /儲存|Save/i }).click();

    // Verify it exists in the list
    await expect(page.getByText(tempLocationName)).toBeVisible();

    // Edit it
    const updatedLocName = tempLocationName + '-U';
    await page.locator('tr').filter({ hasText: tempLocationName }).getByRole('button', { name: /編輯|Edit/i }).click();
    await page.locator('input[value="' + tempLocationName + '"]').fill(updatedLocName);
    await page.getByRole('button', { name: /儲存|Save/i }).click();
    await expect(page.getByText(updatedLocName)).toBeVisible();

    // Delete it
    page.on('dialog', dialog => dialog.accept());
    await page.locator('tr').filter({ hasText: updatedLocName }).getByRole('button', { name: /刪除|Delete/i }).click();
    await expect(page.getByText(updatedLocName)).not.toBeVisible();
  });

});
