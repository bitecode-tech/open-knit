import {z} from "zod";
import {Controller, SubmitHandler, useForm} from "react-hook-form";
import {zodResolver} from "@hookform/resolvers/zod";
import UserService from "@identity/user/services/UserService.ts";
import {useAuth} from "@identity/auth/contexts/AuthContext.tsx";
import {showToast} from "@common/components/blocks/ToastManager.tsx";
import {useQuery, useQueryClient} from "@tanstack/react-query";
import {GenericFormTextInput} from "@common/components/forms/GenericFormTextInput.tsx";
import {GenericButton} from "@common/components/blocks/GenericButton.tsx";

interface FormInputs {
    email?: string,
    name?: string,
    surname?: string
}

const formSchema = z.object({
    name: z
        .union([
            z.literal(""),
            z.string().min(3, "Name must be at least 2 characters"),
        ])
        .optional(),
    surname: z
        .union([
            z.literal(""),
            z.string().min(3, "Name must be at least 2 characters"),
        ])
        .optional(),
});

export function UpdateUserDataFormSection() {
    const {user} = useAuth();
    const queryClient = useQueryClient();

    const {
        control,
        handleSubmit,
        formState: {errors},
        reset,
    } = useForm<FormInputs>({
        mode: 'onBlur',
        resolver: zodResolver(formSchema),
        defaultValues: {
            email: user!.email,
        }
    });

    useQuery({
        queryKey: UserService.QUERY_KEYS.GET_USER_DATA(user!.uuid),
        queryFn: async () => {
            const userData = await UserService.getUserData()
            reset({...userData, email: user!.email});
            return userData;
        },
    });

    const onSubmit: SubmitHandler<FormInputs> = async ({name, surname}) => {
        try {
            await UserService.changeUserData(name, surname);
            await queryClient.invalidateQueries({queryKey: UserService.QUERY_KEYS.GET_USER_DATA(user!.uuid)})
            showToast("success", "User data successfully updated");
        } catch (error) {
            console.log(error)
            showToast("error", "Could not update user data")
        }
    };

    return (
        <form className="flex flex-col gap-1 md:gap-4" onSubmit={handleSubmit(onSubmit)}>
            <div className="flex flex-col md:flex-row md:items-center gap-1 md:gap-4">
                <Controller name="name"
                            control={control}
                            render={({field}) =>
                                <GenericFormTextInput
                                    label="Name"
                                    required
                                    type="text"
                                    errors={errors}
                                    className="md:w-[426px]"
                                    field={field}/>
                            }>
                </Controller>
                <Controller name="surname"
                            control={control}
                            render={({field}) =>
                                <GenericFormTextInput
                                    label="Last name"
                                    required
                                    type="text"
                                    errors={errors}
                                    className="md:w-[426px]"
                                    field={field}/>
                            }>
                </Controller>
            </div>
            <Controller name="email"
                        control={control}
                        render={({field}) =>
                            <GenericFormTextInput
                                label="Email"
                                required
                                type="text"
                                disabled={true}
                                errors={errors}
                                className="md:w-[426px]"
                                field={field}/>
                        }>
            </Controller>
            <GenericButton className="md:w-fit max-md:mt-4" type="submit">Save changes</GenericButton>
        </form>
    );
}
