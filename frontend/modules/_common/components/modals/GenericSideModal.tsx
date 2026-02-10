import {Dispatch, ReactNode, SetStateAction} from "react";
import {Drawer, DrawerHeader, DrawerItems} from "flowbite-react";

export interface GenericSideModalProps {
    headerText: string,
    showState: [boolean, Dispatch<SetStateAction<boolean>>],
    onClose?: () => void
    children: ReactNode
}

export default function GenericSideModal({headerText, showState, onClose, children}: GenericSideModalProps) {
    const [open, setOpen] = showState;

    const handleOnClose = () => {
        setOpen(false)
        if (typeof onClose === "function") {
            onClose();
        }
    }

    return (
        <Drawer
            open={open}
            onClose={handleOnClose}
            position="right"
            backdrop={true}
            className="transition-transform duration-300 ease-in-out w-full md:w-[460px] h-fit rounded-bl-lg p-0"
        >
            <DrawerHeader title={headerText} className="border-b border-gray-200"/>

            <DrawerItems className="p-4">
                {children}
            </DrawerItems>
        </Drawer>
    );
}
