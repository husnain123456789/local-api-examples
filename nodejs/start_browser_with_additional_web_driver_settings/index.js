const { KameleoLocalApiClient, BuilderForCreateProfile } = require('@kameleo/local-api-client');

(async () => {
    try {
        // This is the port Kameleo.CLI is listening on. Default value is 5050, but can be overridden in appsettings.json file
        const kameleoPort = 5050;

        const client = new KameleoLocalApiClient({
            baseUri: `http://localhost:${kameleoPort}`,
            noRetryPolicy: true,
        });

        // Search Chrome Base Profiles
        const chromeBaseProfileList = await client.searchBaseProfiles({
            deviceType: 'desktop',
            browserProduct: 'chrome',
        });

        // Create a new profile with recommended settings
        // Choose one of the Chrome BaseProfiles
        const createProfileRequest = BuilderForCreateProfile
            .forBaseProfile(chromeBaseProfileList[0].id)
            .setRecommendedDefaults()
            .build();
        const profile = await client.createProfile({ body: createProfileRequest });

        // Provide additional settings for the webdriver when starting the browser
        await client.startProfileWithWebDriverSettings(profile.id, {
            body: {
                argumentsProperty: [
                    'mute-audio',
                ],
                preferences: [
                    {
                        key: 'profile.managed_default_content_settings.images',
                        value: 2,
                    },
                    {
                        key: 'profile.password_manager_enabled.images',
                        value: 2,
                    },
                ],
                additionalOptions: [
                    {
                        key: 'pageLoadStrategy',
                        value: 'eager',
                    },
                ],
            },
        });

        // Wait for 10 seconds
        await new Promise((r) => setTimeout(r, 10000));

        // Stop the profile
        await client.stopProfile(profile.id);
    } catch (error) {
        console.error(error);
    }
})();
