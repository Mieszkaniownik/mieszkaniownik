import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Logger, OnModuleInit } from '@nestjs/common';
import { Job } from 'bullmq';
import { ScraperProcessor } from '../scraper.processor';

@Processor('olx-new', {
  concurrency: 5,
})
export class OlxNewProcessor extends WorkerHost implements OnModuleInit {
  private readonly logger = new Logger(OlxNewProcessor.name);

  constructor(private readonly scraperProcessor: ScraperProcessor) {
    super();
  }

  onModuleInit() {
    this.logger.log('OlxNewProcessor initialized and ready to process jobs!');
  }

  async process(job: Job<{ url: string; isNew?: boolean }>): Promise<void> {
    this.logger.log(
      `Processing NEW OLX offer: ${job.data.url} (Job ID: ${job.id})`,
    );

    try {
      await this.scraperProcessor.process(job);
      this.logger.log(`Successfully processed OLX offer: ${job.data.url}`);
    } catch (error) {
      this.logger.error(`Failed to process OLX offer: ${job.data.url}`, error);
      throw error;
    }
  }
}
