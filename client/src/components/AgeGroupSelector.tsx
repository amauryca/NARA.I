import { useEffect, useState } from 'react';
import { AgeGroup } from '@shared/types/index';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';

interface AgeGroupSelectorProps {
  onAgeGroupChange: (ageGroup: AgeGroup) => void;
  initialAgeGroup?: AgeGroup;
}

export function AgeGroupSelector({ onAgeGroupChange, initialAgeGroup = AgeGroup.ADULT }: AgeGroupSelectorProps) {
  const [ageGroup, setAgeGroup] = useState<AgeGroup>(initialAgeGroup);

  // When age group changes, notify parent component
  useEffect(() => {
    onAgeGroupChange(ageGroup);
  }, [ageGroup, onAgeGroupChange]);

  return (
    <div className="p-4 bg-white rounded-lg shadow-sm border border-gray-100">
      <h3 className="text-lg font-medium mb-3">Select Age Group</h3>
      <p className="text-sm text-gray-500 mb-4">
        The AI will adjust its responses based on your age group selection.
      </p>
      <RadioGroup
        value={ageGroup}
        onValueChange={(value) => setAgeGroup(value as AgeGroup)}
        className="space-y-2"
      >
        <div className="flex items-center space-x-2">
          <RadioGroupItem value={AgeGroup.CHILD} id="child" />
          <Label htmlFor="child" className="cursor-pointer">Child (5-12)</Label>
        </div>
        <div className="flex items-center space-x-2">
          <RadioGroupItem value={AgeGroup.TEEN} id="teen" />
          <Label htmlFor="teen" className="cursor-pointer">Teen (13-17)</Label>
        </div>
        <div className="flex items-center space-x-2">
          <RadioGroupItem value={AgeGroup.YOUNG_ADULT} id="young" />
          <Label htmlFor="young" className="cursor-pointer">Young Adult (18-25)</Label>
        </div>
        <div className="flex items-center space-x-2">
          <RadioGroupItem value={AgeGroup.ADULT} id="adult" />
          <Label htmlFor="adult" className="cursor-pointer">Adult (26-59)</Label>
        </div>
        <div className="flex items-center space-x-2">
          <RadioGroupItem value={AgeGroup.SENIOR} id="senior" />
          <Label htmlFor="senior" className="cursor-pointer">Senior (60+)</Label>
        </div>
      </RadioGroup>
    </div>
  );
}
