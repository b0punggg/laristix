"use client";

import { useEffect, useState } from "react";
import { Loader2, Settings } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import {
  usePlatformSettingsQuery,
  useUpdateDefaultFeeMutation,
  useUpdateMaintenanceModeMutation,
} from "@/hooks/use-admin-settings";
import type {
  DefaultPlatformFeeSetting,
  MaintenanceModeSetting,
  PlatformSetting,
} from "@/types/admin";

function getSettingValue<T>(settings: PlatformSetting[] | undefined, key: string): T | null {
  const setting = settings?.find((item) => item.key === key);

  if (!setting) {
    return null;
  }

  return setting.value as T;
}

export function AdminSettingsPanel() {
  const { data: settings, isLoading, isError, refetch } = usePlatformSettingsQuery();
  const updateMaintenance = useUpdateMaintenanceModeMutation();
  const updateDefaultFee = useUpdateDefaultFeeMutation();

  const [maintenance, setMaintenance] = useState<MaintenanceModeSetting>({
    enabled: false,
    message: "Platform is under maintenance. Please try again later.",
  });

  const [defaultFee, setDefaultFee] = useState<DefaultPlatformFeeSetting>({
    fee_type: "percentage",
    percentage_rate: 5,
    flat_amount: 0,
    fee_bearer: "attendee",
  });

  useEffect(() => {
    const maintenanceValue = getSettingValue<MaintenanceModeSetting>(settings, "maintenance_mode");
    const feeValue = getSettingValue<DefaultPlatformFeeSetting>(settings, "default_platform_fee");

    if (maintenanceValue) {
      setMaintenance(maintenanceValue);
    }

    if (feeValue) {
      setDefaultFee(feeValue);
    }
  }, [settings]);

  if (isLoading) {
    return (
      <Card>
        <CardContent className="py-12 text-center text-muted-foreground">
          Loading platform settings...
        </CardContent>
      </Card>
    );
  }

  if (isError) {
    return (
      <Card>
        <CardContent className="space-y-4 py-12 text-center">
          <p className="text-muted-foreground">Failed to load platform settings.</p>
          <Button variant="outline" onClick={() => refetch()}>
            Try again
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Platform settings</h2>
        <p className="text-sm text-muted-foreground">
          Configure global platform behavior and default fees.
        </p>
      </div>

      <Card>
        <CardHeader className="flex flex-row items-center gap-2 pb-2">
          <Settings className="size-4 text-muted-foreground" />
          <CardTitle className="text-base">Maintenance mode</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground">
            When enabled, public API requests return 503 except for admin routes and super admin
            users.
          </p>
          <div className="space-y-2">
            <Label htmlFor="maintenance-enabled">Status</Label>
            <Select
              id="maintenance-enabled"
              value={maintenance.enabled ? "enabled" : "disabled"}
              onChange={(e) =>
                setMaintenance((prev) => ({
                  ...prev,
                  enabled: e.target.value === "enabled",
                }))
              }
            >
              <option value="disabled">Disabled</option>
              <option value="enabled">Enabled</option>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="maintenance-message">Message</Label>
            <Textarea
              id="maintenance-message"
              value={maintenance.message}
              onChange={(e) =>
                setMaintenance((prev) => ({ ...prev, message: e.target.value }))
              }
              rows={3}
            />
          </div>
          <Button
            onClick={() => updateMaintenance.mutate(maintenance)}
            disabled={updateMaintenance.isPending}
          >
            {updateMaintenance.isPending ? (
              <Loader2 className="mr-2 size-4 animate-spin" />
            ) : null}
            Save maintenance mode
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base">Default platform fee</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground">
            Applied at checkout when an organizer has no active fee configuration.
          </p>
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="fee-type">Fee type</Label>
              <Select
                id="fee-type"
                value={defaultFee.fee_type}
                onChange={(e) =>
                  setDefaultFee((prev) => ({
                    ...prev,
                    fee_type: e.target.value as DefaultPlatformFeeSetting["fee_type"],
                  }))
                }
              >
                <option value="percentage">Percentage</option>
                <option value="flat">Flat</option>
                <option value="both">Both</option>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="fee-bearer">Fee bearer</Label>
              <Select
                id="fee-bearer"
                value={defaultFee.fee_bearer}
                onChange={(e) =>
                  setDefaultFee((prev) => ({
                    ...prev,
                    fee_bearer: e.target.value as DefaultPlatformFeeSetting["fee_bearer"],
                  }))
                }
              >
                <option value="attendee">Attendee</option>
                <option value="organizer">Organizer</option>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="percentage-rate">Percentage rate (%)</Label>
              <Input
                id="percentage-rate"
                type="number"
                min={0}
                max={100}
                step={0.01}
                value={defaultFee.percentage_rate}
                onChange={(e) =>
                  setDefaultFee((prev) => ({
                    ...prev,
                    percentage_rate: Number(e.target.value),
                  }))
                }
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="flat-amount">Flat amount (IDR)</Label>
              <Input
                id="flat-amount"
                type="number"
                min={0}
                step={1}
                value={defaultFee.flat_amount}
                onChange={(e) =>
                  setDefaultFee((prev) => ({
                    ...prev,
                    flat_amount: Number(e.target.value),
                  }))
                }
              />
            </div>
          </div>
          <Button
            onClick={() => updateDefaultFee.mutate(defaultFee)}
            disabled={updateDefaultFee.isPending}
          >
            {updateDefaultFee.isPending ? (
              <Loader2 className="mr-2 size-4 animate-spin" />
            ) : null}
            Save default fee
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
