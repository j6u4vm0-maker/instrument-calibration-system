import { test, expect } from '@playwright/test';

test.describe('KST Calibration System Full Functional Check', () => {

  test.beforeEach(async ({ page }) => {
    // Start from home page
    await page.goto('http://localhost:3000');
  });

  test('Dashboard should load with correct navigation and statistics', async ({ page }) => {
    // Check Sidebar links
    await expect(page.getByRole('link', { name: /儀表板|Dashboard/i })).toBeVisible();
    await expect(page.getByRole('link', { name: /設備清單/i })).toBeVisible();
    
    // Check Stats Cards
    await expect(page.getByText(/校正達成率|Compliance Rate/i).first()).toBeVisible();
    await expect(page.getByText(/總儀器數量|Total Instruments/i).first()).toBeVisible();
  });

  test('Gage Inventory - Search and Filter functionality', async ({ page }) => {
    await page.goto('http://localhost:3000/gages');
    await expect(page.getByRole('table')).toBeVisible();

    const searchInput = page.getByPlaceholder(/搜尋設備/i);
    await searchInput.fill('KST');
    await page.keyboard.press('Enter');
    await page.waitForTimeout(1000);
    
    const rows = page.locator('tbody tr');
    const rowCount = await rows.count();
    if (rowCount > 0) {
      // Just verify we don't have an empty state if data exists
      await expect(page.getByText(/找不到符合條件的設備資料/i)).not.toBeVisible();
    }
  });

  test('Gage Inventory - Edit Flow', async ({ page }) => {
    await page.goto('http://localhost:3000/gages');

    // Select the first edit button
    const editButton = page.locator('button[title="編輯設備"]').first();
    await editButton.click();

    // Verify Modal
    await expect(page.getByRole('heading', { name: /編輯設備資訊/i }).first()).toBeVisible();

    const nameInput = page.locator('input[name="name"]');
    const originalName = await nameInput.inputValue();
    const testName = originalName + '_T';
    
    await nameInput.fill(testName);
    await page.getByRole('button', { name: /儲存變更|Save/i }).click();

    // Wait for modal to close and table to refresh
    await expect(page.getByRole('heading', { name: /編輯設備資訊/i })).not.toBeVisible();
    await expect(page.getByText(testName)).toBeVisible({ timeout: 10000 });

    // Revert
    await page.locator('button[title="編輯設備"]').first().click();
    await page.locator('input[name="name"]').fill(originalName);
    await page.getByRole('button', { name: /儲存變更|Save/i }).click();
    await expect(page.getByText(originalName)).toBeVisible({ timeout: 10000 });
  });

  test('Settings - Language and Role Toggle', async ({ page }) => {
    await page.getByRole('button', { name: /偏好設定|Preferences/i }).click();
    await expect(page.getByRole('heading', { name: /系統設定|System Settings/i })).toBeVisible();

    // Toggle to English
    await page.getByRole('button', { name: /English/i }).click();
    await page.getByRole('button', { name: /Done/i }).click();
    
    // Check for English UI
    await expect(page.getByRole('link', { name: 'Dashboard' })).toBeVisible();

    // Toggle back to Chinese
    await page.getByRole('button', { name: /Preferences/i }).click();
    await page.getByRole('button', { name: /繁體中文|Chinese/i }).click();
    await page.getByRole('button', { name: /Done/i }).click();
    await expect(page.getByRole('link', { name: '儀表板' })).toBeVisible();
  });

  test('Report Center - Accessibility', async ({ page }) => {
    await page.goto('http://localhost:3000/reports');
    // Use first() to avoid ambiguity with subheadings
    await expect(page.getByRole('heading', { name: /報告查詢與管理/i }).first()).toBeVisible();
  });

  test('Reminders - Accessibility', async ({ page }) => {
    await page.goto('http://localhost:3000/reminders');
    await expect(page.getByText(/提醒規則/i).first()).toBeVisible();
  });

});
