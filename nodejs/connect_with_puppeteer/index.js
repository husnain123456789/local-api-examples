const { KameleoLocalApiClient, BuilderForCreateProfile } = require("@kameleo/local-api-client");
const puppeteer = require("puppeteer");    

(async () => {
    try {
        // This is the port Kameleo.CLI is listening on. Default value is 5050, but can be overridden in appsettings.json file
        const kameleoPort = 5050;

        const client = new KameleoLocalApiClient({
            baseUri: `http://localhost:${kameleoPort}`,
            noRetryPolicy: true,
        });

        // Search Chrome Base Profiles
        // (Puppeteer won't work with Firefox you can use any Chromium based browser)
        const baseProfiles = await client.searchBaseProfiles({
            deviceType: 'desktop',
            browserProduct: 'chrome',
            language: 'en'
        });

        // Create a new profile with recommended settings
        // for browser fingerprint protection
        const requestBody = BuilderForCreateProfile
            .forBaseProfile(baseProfiles[0].id)
            .setRecommendedDefaults()
            .build();

        let profile = await client.createProfile({ body: requestBody });
        await client.startProfile(profile.id);

        // Connect to the browser through CDP
        const browserWSEndpoint = `ws://localhost:${kameleoPort}/puppeteer/${profile.id}`;
        const browser = await puppeteer.connect({browserWSEndpoint, defaultViewport: null});
        const page = await browser.newPage();


        // Use any Puppeteer command to drive the browser
        // and enjoy full protection from bot detection products
        await page.goto('https://google.com');
        const agreeButton = await page.$('div[aria-modal="true"][tabindex="0"] button + button');
        await agreeButton.click();
        await page.click('[name=q]');
        await page.keyboard.type('Kameleo');
        await page.keyboard.press('Enter');

        // Wait for 5 seconds
        await page.waitForTimeout(5000);

        // Stop the browser by stopping the Kameleo profile
        await client.stopProfile(profile.id);
    } catch (e) {
        console.log(e);
    }
})();