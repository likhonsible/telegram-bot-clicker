import axios, {AxiosResponse} from "axios";
import axiosInstance from "../api/interceptors.ts";
import {ClickerSubscriber, CombinedSubscriberData, Subscriber} from "../types/subscriber.type.ts";
class SubscriberService {

    private BASE_URL = "/subs"

    async getSubscriberData(subscriberId: number): Promise<CombinedSubscriberData> {
        try {
            // First API call to get subscriber data
            const response: AxiosResponse<Subscriber> = await axiosInstance.post(this.BASE_URL + "/one", {
                user_id: subscriberId,
            });

            const subscriber = response.data;

            // Second API call to get additional data
            const additionalDataResponse: AxiosResponse<ClickerSubscriber> = await axios.get(
                import.meta.env.VITE_REACT_CLICKER_API_URL + `/user/${subscriber.user_id}`,
            );

            const additionalData = additionalDataResponse.data;

            // Combine the responses into one object
            return <CombinedSubscriberData> {
                ...subscriber,
                ...additionalData
            };

        } catch (error) {
            throw new Error('Failed to fetch subscriber data');
        }
    }

    async getClickerLevels() {
        return axios.get(
            import.meta.env.VITE_REACT_CLICKER_API_URL + `/level`,
        ).then(res => res.data)
    }

    async getMaxEnergyLevels() {
        return axios.get(
            import.meta.env.VITE_REACT_CLICKER_API_URL + `/max-energy-level`,
        ).then(res => res.data)
    }

    async updateSubscriberTokens(subscriberId: number, tokens: number) {
        await axiosInstance.post(this.BASE_URL + "/update-tokens", {
            user_id: subscriberId,
            tokens: tokens
        })
    }

    async updateClickerLevel(subscriberId: number, levelUpgradeCost: number) {
        return axiosInstance.put(this.BASE_URL + "/remove-tokens", {
            user_id: subscriberId,
            tokensToRemove: levelUpgradeCost
        }).then(() =>
            axios.put(
                import.meta.env.VITE_REACT_CLICKER_API_URL + `/user/upgrade-level`,
                {
                    telegramId: subscriberId
                }
            )
        )
    }

    async updateSubscriberMaxEnergy(subscriberId: number, levelUpgradeCost: number) {
        return axiosInstance.put(this.BASE_URL + "/remove-tokens", {
            user_id: subscriberId,
            tokensToRemove: levelUpgradeCost
        }).then(() =>
            axios.patch(
                import.meta.env.VITE_REACT_CLICKER_API_URL + `/user/upgrade-max-energy`,
                {
                    telegramId: subscriberId
                }
            )
        )
    }
}

export default new SubscriberService()

