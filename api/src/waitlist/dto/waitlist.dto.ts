import { ApiProperty, OmitType, PartialType } from '@nestjs/swagger';

export class ParentDto {
  @ApiProperty()
  id!: number;

  @ApiProperty()
  firstName!: string;

  @ApiProperty({ required: false })
  lastName?: string;

  @ApiProperty()
  phone!: string;

  @ApiProperty()
  email!: string;

  @ApiProperty()
  affiliation!: string;
}

export class CreateParentDto extends OmitType(ParentDto, ['id'] as const) {}
export class UpdateParentDto extends PartialType(CreateParentDto) {}

export class ChildDto {
  @ApiProperty()
  id!: number;

  @ApiProperty()
  parentId!: number;

  @ApiProperty()
  firstName!: string;

  @ApiProperty({ required: false })
  lastName?: string;

  @ApiProperty()
  dob!: string;

  @ApiProperty()
  requestedHours!: string;

  @ApiProperty()
  startDate!: string;

  @ApiProperty()
  immunizationStatus!: string;
}

export class CreateChildDto extends OmitType(ChildDto, ['id'] as const) {}
export class CreateChildWithoutParentDto extends OmitType(ChildDto, ['id', 'parentId'] as const) {}
export class UpdateChildDto extends PartialType(CreateChildDto) {}

export class AddParentChildDto {
  @ApiProperty({ type: () => CreateParentDto, description: 'Parent details to create together with the child.' })
  parent!: CreateParentDto;

  @ApiProperty({ type: () => CreateChildWithoutParentDto, description: 'Child details to create, parentId is assigned automatically.' })
  child!: CreateChildWithoutParentDto;
}

export class AddParentChildResponseDto {
  @ApiProperty({ type: () => ParentDto })
  parent!: ParentDto;

  @ApiProperty({ type: () => ChildDto })
  child!: ChildDto;
}

// Multi-child variant
export class AddParentChildrenDto {
  @ApiProperty({ type: () => CreateParentDto, description: 'Parent details to create together with one or more children.' })
  parent!: CreateParentDto;

  @ApiProperty({ type: () => [CreateChildWithoutParentDto], description: 'One or more children to create. parentId is assigned automatically.' })
  children!: CreateChildWithoutParentDto[];
}

export class AddParentChildrenResponseDto {
  @ApiProperty({ type: () => ParentDto })
  parent!: ParentDto;

  @ApiProperty({ type: () => [ChildDto] })
  children!: ChildDto[];
}
