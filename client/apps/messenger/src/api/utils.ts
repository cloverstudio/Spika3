import api from "./api";

type CityType = {
    value: string;
    label: string;
};

const utilsApi = api.injectEndpoints({
    endpoints: (build) => ({
        getCities: build.query<CityType[], { country: string; inputText: string }>({
            query: ({ country, inputText }) =>
                `/messenger/utils/get-cities?country=${country}&inputText=${inputText}`,
            // providesTags: [{ type: "Cities" }],
            transformResponse: (res) => res.cities,
        }),
    }),
    overrideExisting: true,
});

export const { useGetCitiesQuery, useLazyGetCitiesQuery } = utilsApi;
export default utilsApi;
