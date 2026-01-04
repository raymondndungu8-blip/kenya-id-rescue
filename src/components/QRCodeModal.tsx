import { QRCodeSVG } from "qrcode.react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Smartphone } from "lucide-react";

const QRCodeModal = () => {
  const appUrl = "https://3681fa05-7a76-4952-b266-5189e4448853.lovableproject.com";

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="gap-2">
          <Smartphone className="w-4 h-4" />
          Test on Phone
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-center">Scan to Test on Phone</DialogTitle>
        </DialogHeader>
        <div className="flex flex-col items-center gap-4 py-6">
          <div className="p-4 bg-white rounded-xl">
            <QRCodeSVG
              value={appUrl}
              size={200}
              level="H"
              includeMargin
            />
          </div>
          <p className="text-sm text-muted-foreground text-center">
            Scan this QR code with your phone camera to open the app
          </p>
          <p className="text-xs text-muted-foreground/70 text-center break-all max-w-[280px]">
            {appUrl}
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default QRCodeModal;
