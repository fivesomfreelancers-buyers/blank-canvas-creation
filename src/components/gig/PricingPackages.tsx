import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { ArrowRight, ArrowLeft, DollarSign, Clock, RefreshCw, Plus, X } from 'lucide-react';
import { GigData, PackageData } from '../../pages/CreateGig';

interface PricingPackagesProps {
  gigData: GigData;
  updateGigData: (data: Partial<GigData>) => void;
  onNext: () => void;
  onPrevious: () => void;
  isFirstStep?: boolean;
  isLastStep?: boolean;
}

const deliveryOptions = ['1 day', '2 days', '3 days', '5 days', '7 days', '10 days', '14 days', '21 days', '30 days'];
const revisionOptions = ['0', '1', '2', '3', '5', 'Unlimited'];

const PricingPackages = ({ gigData, updateGigData, onNext, onPrevious }: PricingPackagesProps) => {
  const updatePackage = (packageType: keyof typeof gigData.packages, updates: Partial<PackageData>) => {
    const updatedPackages = {
      ...gigData.packages,
      [packageType]: { ...gigData.packages[packageType], ...updates }
    };
    updateGigData({ packages: updatedPackages });
  };

  const togglePackage = (packageType: keyof typeof gigData.packages) => {
    updatePackage(packageType, { isActive: !gigData.packages[packageType].isActive });
  };

  const addFeature = (packageType: keyof typeof gigData.packages, feature: string) => {
    const f = feature.trim();
    const existing = gigData.packages[packageType].features;
    if (f && existing.length < 10 && !existing.some((x) => x.toLowerCase() === f.toLowerCase())) {
      updatePackage(packageType, { features: [...existing, f] });
    }
  };

  const removeFeature = (packageType: keyof typeof gigData.packages, featureIndex: number) => {
    const newFeatures = gigData.packages[packageType].features.filter((_, index) => index !== featureIndex);
    updatePackage(packageType, { features: newFeatures });
  };

  const labels: Record<string, string> = { basic: 'Basic', standard: 'Standard', premium: 'Premium' };
  const entries = (Object.keys(gigData.packages) as Array<keyof typeof gigData.packages>)
    .map((k) => [k, gigData.packages[k]] as const)
    .filter(([, p]) => p.isActive);
  const errors: string[] = [];
  if (entries.length === 0) errors.push('Activate at least one package.');
  entries.forEach(([k, p]) => {
    const name = labels[k];
    if (!(Number(p.price) > 0)) errors.push(`${name}: enter a price.`);
    if (!p.deliveryTime) errors.push(`${name}: choose a delivery time.`);
    if (!p.revisions) errors.push(`${name}: choose the number of revisions.`);
    if (p.features.length < 3) errors.push(`${name}: add at least 3 "What's Included" items (${p.features.length}/3).`);
  });
  const signature = (f: string[]) => f.map((x) => x.trim().toLowerCase()).sort().join('|');
  for (let i = 0; i < entries.length; i++) {
    for (let j = i + 1; j < entries.length; j++) {
      const [a, pa] = entries[i];
      const [b, pb] = entries[j];
      if (pa.features.length && signature(pa.features) === signature(pb.features)) {
        errors.push(`${labels[a]} and ${labels[b]} have the same "What's Included" list. Each package must offer something different.`);
      }
    }
  }
  const isValid = errors.length === 0;

  const handleNext = () => {
    if (isValid) onNext();
  };

  return (
    <div className="space-y-8">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold text-foreground mb-2">Step 2: Pricing Packages</h2>
        <p className="text-muted-foreground">Set up your service packages and pricing (activate at least one package)</p>
      </div>

      <div className="grid gap-6">
        <PackageCard packageType="basic" pkg={gigData.packages.basic} title="Basic Package" updatePackage={updatePackage} togglePackage={togglePackage} addFeature={addFeature} removeFeature={removeFeature} />
        <PackageCard packageType="standard" pkg={gigData.packages.standard} title="Standard Package" updatePackage={updatePackage} togglePackage={togglePackage} addFeature={addFeature} removeFeature={removeFeature} />
        <PackageCard packageType="premium" pkg={gigData.packages.premium} title="Premium Package" updatePackage={updatePackage} togglePackage={togglePackage} addFeature={addFeature} removeFeature={removeFeature} />
      </div>

      {!isValid && (
        <div className="rounded-lg border border-destructive/40 bg-destructive/10 p-4 text-sm text-destructive space-y-1">
          {errors.map((e) => <p key={e}>{e}</p>)}
        </div>
      )}

      <div className="flex justify-between pt-6 border-t border-border">
        <Button onClick={onPrevious} variant="outline" className="flex items-center space-x-2">
          <ArrowLeft className="w-4 h-4" />
          <span>Previous</span>
        </Button>
        <Button onClick={handleNext} disabled={!isValid} className="flex items-center space-x-2 bg-cyan-500 hover:bg-cyan-600">
          <span>Next: Description</span>
          <ArrowRight className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );
};

interface PackageCardProps {
  packageType: 'basic' | 'standard' | 'premium';
  pkg: PackageData;
  title: string;
  updatePackage: (type: 'basic' | 'standard' | 'premium', updates: Partial<PackageData>) => void;
  togglePackage: (type: 'basic' | 'standard' | 'premium') => void;
  addFeature: (type: 'basic' | 'standard' | 'premium', feature: string) => void;
  removeFeature: (type: 'basic' | 'standard' | 'premium', idx: number) => void;
}

const PackageCard = ({ packageType, pkg, title, updatePackage, togglePackage, addFeature, removeFeature }: PackageCardProps) => {
  const [newFeature, setNewFeature] = useState('');

  return (
    <div className={`border-2 rounded-lg p-6 transition-all ${pkg.isActive ? 'border-cyan-500 bg-cyan-50/50 dark:bg-cyan-950/20' : 'border-border bg-muted/30'}`}>
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-foreground">{title}</h3>
        <Button variant={pkg.isActive ? "default" : "outline"} size="sm" onClick={() => togglePackage(packageType)}>
          {pkg.isActive ? 'Active' : 'Activate'}
        </Button>
      </div>

      {pkg.isActive && (
        <div className="space-y-4">
          <div>
            <Label className="text-sm font-medium">Package Name</Label>
            <Input value={pkg.name} onChange={(e) => updatePackage(packageType, { name: e.target.value })} placeholder={title} className="mt-1" />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label className="text-sm font-medium">Price (USD) *</Label>
              <div className="relative mt-1">
                <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                <Input
                  type="text"
                  inputMode="numeric"
                  value={pkg.price}
                  onChange={(e) => {
                    const val = e.target.value.replace(/[^0-9.]/g, '');
                    updatePackage(packageType, { price: val });
                  }}
                  className="pl-9"
                  placeholder="15"
                />
              </div>
            </div>
            <div>
              <Label className="text-sm font-medium">Delivery Time *</Label>
              <div className="relative mt-1">
                <Clock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                <select value={pkg.deliveryTime} onChange={(e) => updatePackage(packageType, { deliveryTime: e.target.value })} className="w-full h-10 pl-9 pr-3 border border-input rounded-md bg-background text-foreground focus:ring-2 focus:ring-ring">
                  <option value="">Select</option>
                  {deliveryOptions.map(option => <option key={option} value={option}>{option}</option>)}
                </select>
              </div>
            </div>
          </div>

          <div>
            <Label className="text-sm font-medium">Revisions *</Label>
            <div className="relative mt-1">
              <RefreshCw className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
              <select value={pkg.revisions} onChange={(e) => updatePackage(packageType, { revisions: e.target.value })} className="w-full h-10 pl-9 pr-3 border border-input rounded-md bg-background text-foreground focus:ring-2 focus:ring-ring">
                <option value="">Select</option>
                {revisionOptions.map(option => <option key={option} value={option}>{option}</option>)}
              </select>
            </div>
          </div>

          <div>
            <Label className="text-sm font-medium">What's Included *</Label>
            <div className="mt-2 space-y-2">
              {pkg.features.map((feature, index) => (
                <div key={index} className="flex items-center space-x-2">
                  <Badge variant="outline" className="flex-1 justify-between">
                    <span>{feature}</span>
                    <X className="w-3 h-3 cursor-pointer hover:text-destructive ml-2" onClick={() => removeFeature(packageType, index)} />
                  </Badge>
                </div>
              ))}
              {pkg.features.length < 10 && (
                <div className="flex space-x-2">
                  <Input
                    value={newFeature}
                    onChange={(e) => setNewFeature(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') { e.preventDefault(); addFeature(packageType, newFeature); setNewFeature(''); }
                    }}
                    placeholder="e.g., Source file included"
                    className="flex-1"
                  />
                  <Button size="sm" onClick={() => { addFeature(packageType, newFeature); setNewFeature(''); }} disabled={!newFeature.trim()}>
                    <Plus className="w-4 h-4" />
                  </Button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PricingPackages;
