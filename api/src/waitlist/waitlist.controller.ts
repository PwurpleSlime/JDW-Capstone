import { BadRequestException, Controller, Get, Post, Put, Delete, Body, Param } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiParam, ApiBody, ApiExtraModels } from '@nestjs/swagger';
import { WaitlistService } from './waitlist.service';
import {
  AddParentChildDto,
  AddParentChildResponseDto,
  CreateParentDto,
  UpdateParentDto,
  CreateChildDto,
  CreateChildWithoutParentDto,
  UpdateChildDto,
  ParentDto,
  ChildDto,
} from './dto/waitlist.dto';

@ApiTags('waitlist')
@ApiExtraModels(
  AddParentChildDto,
  AddParentChildResponseDto,
  ParentDto,
  ChildDto,
  CreateParentDto,
  UpdateParentDto,
  CreateChildDto,
  CreateChildWithoutParentDto,
  UpdateChildDto,
)
@Controller('waitlist')
export class WaitlistController {
  constructor(private readonly waitlistService: WaitlistService) {}

  // Special POST: Create both parent and child together
  @Post('add-parent-child')
  @ApiOperation({ summary: 'Create a new parent and child together' })
  @ApiBody({ type: AddParentChildDto })
  @ApiResponse({ status: 201, description: 'Parent and child were created successfully', type: AddParentChildResponseDto })
  async addParentAndChild(@Body() body: AddParentChildDto) {
    if (!body.parent) {
      throw new BadRequestException('Parent payload is required');
    }
    return this.waitlistService.addParentAndChild(body.parent, body.child);
  }

  // Parents CRUD
  @Post('parent')
  @ApiOperation({ summary: 'Create a new parent entry' })
  @ApiBody({ type: CreateParentDto })
  @ApiResponse({ status: 201, description: 'Parent created successfully', type: ParentDto })
  async createParent(@Body() parent: CreateParentDto) {
    return this.waitlistService.createParent(parent);
  }

  @Get('parent/:id')
  @ApiOperation({ summary: 'Retrieve a parent by ID' })
  @ApiParam({ name: 'id', type: 'number', description: 'Parent ID' })
  @ApiResponse({ status: 200, description: 'Parent returned successfully', type: ParentDto })
  async getParent(@Param('id') id: string) {
    return this.waitlistService.getParent(+id);
  }

  @Put('parent/:id')
  @ApiOperation({ summary: 'Update a parent by ID' })
  @ApiParam({ name: 'id', type: 'number', description: 'Parent ID to update' })
  @ApiBody({ type: UpdateParentDto })
  @ApiResponse({ status: 200, description: 'Parent updated successfully', type: ParentDto })
  async updateParent(@Param('id') id: string, @Body() updates: UpdateParentDto) {
    return this.waitlistService.updateParent(+id, updates);
  }

  @Delete('parent/:id')
  @ApiOperation({ summary: 'Delete a parent by ID' })
  @ApiParam({ name: 'id', type: 'number', description: 'Parent ID to delete' })
  @ApiResponse({ status: 200, description: 'Parent deleted successfully' })
  async deleteParent(@Param('id') id: string) {
    return this.waitlistService.deleteParent(+id);
  }

  // Children CRUD
  @Post('child')
  @ApiOperation({ summary: 'Create a new child entry' })
  @ApiBody({ type: CreateChildDto })
  @ApiResponse({ status: 201, description: 'Child created successfully', type: ChildDto })
  async createChild(@Body() child: CreateChildDto) {
    return this.waitlistService.createChild(child);
  }

  @Get('child/:id')
  @ApiOperation({ summary: 'Retrieve a child by ID' })
  @ApiParam({ name: 'id', type: 'number', description: 'Child ID' })
  @ApiResponse({ status: 200, description: 'Child returned successfully', type: ChildDto })
  async getChild(@Param('id') id: string) {
    return this.waitlistService.getChild(+id);
  }

  @Put('child/:id')
  @ApiOperation({ summary: 'Update a child by ID' })
  @ApiParam({ name: 'id', type: 'number', description: 'Child ID to update' })
  @ApiBody({ type: UpdateChildDto })
  @ApiResponse({ status: 200, description: 'Child updated successfully', type: ChildDto })
  async updateChild(@Param('id') id: string, @Body() updates: UpdateChildDto) {
    return this.waitlistService.updateChild(+id, updates);
  }

  @Delete('child/:id')
  @ApiOperation({ summary: 'Delete a child by ID' })
  @ApiParam({ name: 'id', type: 'number', description: 'Child ID to delete' })
  @ApiResponse({ status: 200, description: 'Child deleted successfully' })
  async deleteChild(@Param('id') id: string) {
    return this.waitlistService.deleteChild(+id);
  }
}
