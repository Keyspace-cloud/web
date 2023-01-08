import { Box, Tabs, TabList, Tab, TabPanels, TabPanel } from "@chakra-ui/react"
import { Profile } from './Profile'
import { AppSettings } from "./AppSettings"

export const Settings = () => {
    return (
        <Box p={8}>
            <Tabs colorScheme={'primary'} isLazy>
                <TabList>
                    <Tab>Profile</Tab>
                    <Tab>App</Tab>
                </TabList>

                <TabPanels>
                    <TabPanel>
                        <Profile />
                    </TabPanel>
                    <TabPanel>
                        <AppSettings />
                    </TabPanel>
                </TabPanels>
            </Tabs>
        </Box>
    )
}