// Import necessary Synpress modules and setup
import { testWithSynpress } from '@synthetixio/synpress'
import { Phantom, phantomFixtures } from '@synthetixio/synpress/playwright'
import basicSetup from '../test/wallet-setup/basic.setup'

// Create a test instance with Synpress and Phantom fixtures
const test = testWithSynpress(phantomFixtures(basicSetup))

// Extract expect function from test
const { expect } = test

// Define a basic test case
test('should connect wallet to the Phantom Test Dapp', async ({
  context,
  page,
  phantomPage,
  extensionId,
}) => {

  // Set timeout to 120 seconds so await operations have enough time to complete
  test.setTimeout(120000);

  // Create a new Phantom instance (standard)
  const phantom = new Phantom(
    context,
    phantomPage,
    basicSetup.walletPassword,
    extensionId
  )

  // Navigate to the Phantom extension popup
  await page.goto('chrome-extension://' + extensionId + '/popup.html');

  // Wait for first ads to load in (they have a delay)
  await page.waitForTimeout(5000);

  /* There are currently some Phantom ads that appear on wallet startup
   This loop closes them when they appear
   The Monad and pSOL ads don't show in the same order every time
   so we loop over all possible selectors for as many times as there are steps
   to close them all */
   
  const phantomAdSelectors = ['text=Got It', 'text=Convert SOL', 'text=Back'];
  for(let i = 0; i < phantomAdSelectors.length; i++) {
    // Wait for ad animation
    await page.waitForTimeout(2000);
    
    for (const selector of phantomAdSelectors) {
      // iterate over selectors and see if they exist via the .count() method
      const elementCount = await page.locator(selector).count();

      // If an element exists, try to click it
      if (elementCount > 0) {
        await page.locator(selector).click();
      }
    }
  } 
  
  // Enable Testnet Mode in Phantom settings
  await page.waitForTimeout(2000);  
  await page.locator('[data-testid = settings-menu-open-button]').click();  
  await page.locator('[data-testid = sidebar_menu-button-settings]').click()
  await page.locator('text=Developer Settings').click();
  await page.locator('text=Testnet Mode').click();

  // Navigate to the homepage
  await page.goto('/');
  
  // Click the connect button
  await page.locator('#WalletButton').click()
  
  await page.locator('text=Phantom').click()
  // Connect Phantom to the dapp
  await phantom.connectToDapp()
  
  // Verify the connected account address
  await expect(page.locator('#WalletButton')).toContainText(("oeYf..kq96"))
  
  // await page.pause();
})