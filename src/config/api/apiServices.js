import {
    apiServices,
    apiHooks,
    userApi,
    roleApi,
    leadApi,
    contactApi,
    pipelineApi,
    stageApi,
    filterApi
} from './apiServicesImpl.js';

export const apiServiceNames = ['user', 'role', 'lead', 'contact', 'pipeline', 'stage', 'filter'];

export {
    userApi,
    roleApi,
    leadApi,
    contactApi,
    pipelineApi,
    stageApi,
    filterApi
};

export const {
    // Users
    useGetUsersQuery, useGetUserQuery, useCreateUserMutation, useUpdateUserMutation, useDeleteUserMutation,
    // Roles
    useGetRolesQuery, useGetRoleQuery, useCreateRoleMutation, useUpdateRoleMutation, useDeleteRoleMutation,
    // Leads
    useGetLeadsQuery, useGetLeadQuery, useCreateLeadMutation, useUpdateLeadMutation, useDeleteLeadMutation,
    // Contacts
    useGetContactsQuery, useGetContactQuery, useCreateContactMutation, useUpdateContactMutation, useDeleteContactMutation,
    // Pipelines
    useGetPipelinesQuery, useGetPipelineQuery, useCreatePipelineMutation, useUpdatePipelineMutation, useDeletePipelineMutation,
    // Stages
    useGetStagesQuery, useGetStageQuery, useCreateStageMutation, useUpdateStageMutation, useDeleteStageMutation,
    // Filters
    useGetFiltersQuery, useGetFilterQuery, useCreateFilterMutation, useUpdateFilterMutation, useDeleteFilterMutation
} = apiHooks;

export { apiServices, apiHooks };