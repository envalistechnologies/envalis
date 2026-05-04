import { Trash } from "@phosphor-icons/react";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";

const ConfirmDelete = ({ onConfirm, loading, triggerLabel = "Delete", title = "Are you absolutely sure?", description = "This action cannot be undone. This will permanently delete the record.", children }) => (
    <AlertDialog>
        <AlertDialogTrigger asChild>
            {children || (
                <Button variant="outline" size="sm" className="text-destructive hover:text-destructive border-destructive/30 hover:border-destructive hover:bg-destructive/5">
                    <Trash size={14} className="mr-1" /> {triggerLabel}
                </Button>
            )}
        </AlertDialogTrigger>
        <AlertDialogContent>
            <AlertDialogHeader>
                <AlertDialogTitle>{title}</AlertDialogTitle>
                <AlertDialogDescription>{description}</AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction onClick={onConfirm} disabled={loading}>
                    {loading ? "Deleting..." : "Yes, Delete"}
                </AlertDialogAction>
            </AlertDialogFooter>
        </AlertDialogContent>
    </AlertDialog>
);

export default ConfirmDelete;