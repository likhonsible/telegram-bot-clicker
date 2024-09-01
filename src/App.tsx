import BottomNav from "./components/BottomNav.tsx";
import useSubscriberData from "./hooks/useSubscriberData.tsx";
import {
    DELAY_OF_INCREASING_OF_ENERGY,
    ENERGY_TO_INCREASE,
} from "./constants/constants.ts";
import useAppStore from "./hooks/useAppStore.ts";
import {useEffect} from "react";
import {Outlet} from "react-router-dom";
import {CombinedSubscriberData} from "./types/subscriber.type.ts";
import MinedTokensSheet from "./components/sheets/MinedTokensSheet.tsx";
import Loader from "./ui/Loader.tsx";
import StyledToaster from "./ui/StyledToaster.tsx";
import ErrorLayout from "./ui/ErrorLayout.tsx";
import ReferralHandler from "./hooks/ReferralHandler.tsx";
import {io} from "socket.io-client";
const App = () => {

    // --- Get subscriber data on launch ---

    const {subscriber, isLoading, isError} = useSubscriberData()
    const socket = io(import.meta.env.VITE_REACT_CLICKER_API_URL)


    // --- Get tokens and energy, then save in local state ---

    useEffect(() => {
        if (subscriber) {

            socket.on('connect', () => {
                socket.emit('register', {subscriberId: subscriber.user_id});
            });

            const maxEnergy = subscriber.currentMaxEnergyLevel.maxEnergy
            const getEnergy = (subscriber: CombinedSubscriberData, maxEnergy: number): number => {
                const differenceInSeconds = Math.floor((Date.now() - new Date(subscriber.savedEnergyTimestamp).getTime()) / 1000)
                const currentEnergy = subscriber.savedEnergy + differenceInSeconds * ENERGY_TO_INCREASE

                return currentEnergy < maxEnergy ? currentEnergy : maxEnergy
            }

            useAppStore.getState().updateTokens(subscriber.tokens)
            useAppStore.getState().updateEnergy(getEnergy(subscriber, maxEnergy))

            const interval = setInterval(() => {
                if (useAppStore.getState().energy < maxEnergy) {
                    useAppStore.getState().increaseEnergy(ENERGY_TO_INCREASE)
                    socket.emit('syncEnergy', {energy: useAppStore.getState().energy})
                }
            }, DELAY_OF_INCREASING_OF_ENERGY);

            return () => {
                clearInterval(interval);
            }
        }
    }, [subscriber]);

    if (isLoading) return <Loader/>

    if (isError) return <ErrorLayout/>

    return (
        <div>
            <StyledToaster/>
            <div
                className="min-h-screen max-h-screen p-4 bg-gradient-to-b from-[#000] to-[#271732] flex flex-col items-center text-white font-futura">
                <div id="clicker" className="flex-grow flex flex-col w-full overflow-auto">
                    <Outlet context={subscriber}/>
                </div>
                <BottomNav/>
            </div>
            <MinedTokensSheet subscriber={subscriber}/>
            <ReferralHandler subscriber={subscriber}/>
        </div>

    );
};

export const socket = io(import.meta.env.VITE_REACT_CLICKER_API_URL)


export default App;