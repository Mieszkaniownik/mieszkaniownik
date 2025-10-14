import { Injectable, Logger } from '@nestjs/common';
import { DatabaseService } from '../database/database.service';
import type {
  HeatmapData,
  HeatmapPoint,
  HeatmapQuery,
} from './dto/heatmap.interface';
import type { BuildingType } from '@prisma/client';

@Injectable()
export class HeatmapService {
  private readonly logger = new Logger(HeatmapService.name);

  constructor(private readonly databaseService: DatabaseService) {}

  private calculateViewsPerDay(views: number, createdAt: Date): number {
    const now = new Date();
    const offerAgeInMs = now.getTime() - createdAt.getTime();
    const offerAgeInDays = offerAgeInMs / (1000 * 60 * 60 * 24);

    const daysForCalculation = Math.max(offerAgeInDays, 0.1);

    return views / daysForCalculation;
  }

  async generateHeatmapData(
    query: HeatmapQuery = {},
    userId?: number,
  ): Promise<HeatmapData> {
    this.logger.log('Generating heatmap data with query:', query);
    this.logger.log(`Applied limit: ${Number(query.limit) || 5000}`);

    if (userId) {
      this.logger.log(`Generating heatmap for user ${userId} matches`);
      return this.generateUserMatchesHeatmap(query, userId);
    }

    const whereClause = this.buildWhereClause(query);

    const offers = await this.databaseService.offer.findMany({
      where: {
        ...whereClause,
        available: true,
        views: { gt: 0 },
        latitude: { not: null },
        longitude: { not: null },
      },
      orderBy: {
        createdAt: 'desc',
      },
      take: Number(query.limit) || 5000,
    });

    this.logger.log(
      `Found ${offers.length} offers with coordinates for heatmap`,
    );

    if (offers.length === 0) {
      return {
        points: [],
        avgViews: 0,
        minViews: 0,
        totalOffers: 0,
        avgViewsPerDay: 0,
        maxViewsPerDay: 0,
        minViewsPerDay: 0,
      };
    }

    const viewsCounts = offers.map((offer) => offer.views);
    const avgViews =
      viewsCounts.reduce((sum, val) => sum + val, 0) / viewsCounts.length;
    const minViews = Math.min(...viewsCounts);

    const viewsPerDayList = offers.map((offer) =>
      this.calculateViewsPerDay(offer.views, offer.createdAt),
    );
    const maxViewsPerDay = Math.max(...viewsPerDayList);
    const minViewsPerDay = Math.min(...viewsPerDayList);
    const avgViewsPerDay =
      viewsPerDayList.reduce((sum, val) => sum + val, 0) /
      viewsPerDayList.length;

    const offersWithPricePerSqm = offers.filter(
      (offer) =>
        offer.price &&
        offer.footage &&
        Number(offer.price) > 0 &&
        Number(offer.footage) > 0,
    );

    const pricesPerSqm = offersWithPricePerSqm.map((offer) => {
      const price = Number(offer.price);
      const footage = Number(offer.footage);
      return price / footage;
    });

    const maxPricePerSqm =
      pricesPerSqm.length > 0 ? Math.max(...pricesPerSqm) : undefined;
    const minPricePerSqm =
      pricesPerSqm.length > 0 ? Math.min(...pricesPerSqm) : undefined;
    const avgPricePerSqm =
      pricesPerSqm.length > 0
        ? pricesPerSqm.reduce((sum, val) => sum + val, 0) / pricesPerSqm.length
        : undefined;

    const densityRadius = 0.01;
    const densityMap = new Map<number, number>();

    offers.forEach((offer, index) => {
      if (offer.latitude === null || offer.longitude === null) return;

      const lat = Number(offer.latitude);
      const lng = Number(offer.longitude);
      let nearbyCount = 0;

      offers.forEach((otherOffer) => {
        if (otherOffer.latitude === null || otherOffer.longitude === null) {
          return;
        }

        const otherLat = Number(otherOffer.latitude);
        const otherLng = Number(otherOffer.longitude);

        const distance = Math.sqrt(
          Math.pow(lat - otherLat, 2) + Math.pow(lng - otherLng, 2),
        );

        if (distance <= densityRadius) {
          nearbyCount++;
        }
      });

      densityMap.set(index, nearbyCount);
    });

    const densityCounts = Array.from(densityMap.values());
    const maxDensity =
      densityCounts.length > 0 ? Math.max(...densityCounts) : undefined;
    const minDensity =
      densityCounts.length > 0 ? Math.min(...densityCounts) : undefined;
    const avgDensity =
      densityCounts.length > 0
        ? densityCounts.reduce((sum, val) => sum + val, 0) /
          densityCounts.length
        : undefined;

    const offersWithFootage = offers.filter(
      (offer) => offer.footage && Number(offer.footage) > 0,
    );

    const footages = offersWithFootage.map((offer) => Number(offer.footage));
    const maxFootage = footages.length > 0 ? Math.max(...footages) : undefined;
    const minFootage = footages.length > 0 ? Math.min(...footages) : undefined;
    const avgFootage =
      footages.length > 0
        ? footages.reduce((sum, val) => sum + val, 0) / footages.length
        : undefined;

    const points: HeatmapPoint[] = [];
    const bounds = {
      north: -90,
      south: 90,
      east: -180,
      west: 180,
    };

    for (const [index, offer] of offers.entries()) {
      if (offer.latitude !== null && offer.longitude !== null) {
        const viewsPerDay = this.calculateViewsPerDay(
          offer.views,
          offer.createdAt,
        );

        const intensity =
          maxViewsPerDay > minViewsPerDay
            ? (viewsPerDay - minViewsPerDay) / (maxViewsPerDay - minViewsPerDay)
            : 1;

        const pricePerSqm =
          offer.price && offer.footage && Number(offer.footage) > 0
            ? Number(offer.price) / Number(offer.footage)
            : undefined;

        const offerDensity = densityMap.get(index) || 1;

        const point: HeatmapPoint = {
          lat: Number(offer.latitude),
          lng: Number(offer.longitude),
          intensity: Math.max(0.1, intensity),
          weight: offer.views,
          offerId: offer.id,
          title: offer.title,
          price: offer.price ? Number(offer.price) : undefined,
          footage: offer.footage ? Number(offer.footage) : undefined,
          pricePerSqm: pricePerSqm,
          offerDensity: offerDensity,
          viewsPerDay: viewsPerDay,
          address:
            offer.street && offer.streetNumber
              ? `${offer.street} ${offer.streetNumber}`
              : offer.district || offer.city,
        };

        points.push(point);

        bounds.north = Math.max(bounds.north, point.lat);
        bounds.south = Math.min(bounds.south, point.lat);
        bounds.east = Math.max(bounds.east, point.lng);
        bounds.west = Math.min(bounds.west, point.lng);
      }
    }

    this.logger.log(
      `Generated ${points.length} heatmap points from stored coordinates (no geocoding needed!)`,
    );

    return {
      points,
      avgViews,
      minViews,
      totalOffers: offers.length,
      maxPricePerSqm,
      minPricePerSqm,
      avgPricePerSqm,
      maxDensity,
      minDensity,
      avgDensity,
      maxFootage,
      minFootage,
      avgFootage,
      avgViewsPerDay,
      maxViewsPerDay,
      minViewsPerDay,
      bounds: points.length > 0 ? bounds : undefined,
    };
  }

  async getHeatmapStats(userId?: number) {
    if (userId) {
      return this.getUserMatchesStats(userId);
    }

    const totalOffers = await this.databaseService.offer.count({
      where: { available: true },
    });

    const offersWithViews = await this.databaseService.offer.count({
      where: { available: true, views: { gt: 0 } },
    });

    const offersWithAddresses = await this.databaseService.offer.count({
      where: {
        available: true,
        OR: [{ street: { not: '' } }, { district: { not: '' } }],
      },
    });

    const offersWithCoordinates = await this.databaseService.offer.count({
      where: {
        available: true,
        latitude: { not: null },
        longitude: { not: null },
      },
    });

    const viewsStats = await this.databaseService.offer.aggregate({
      where: { available: true, views: { gt: 0 } },
      _avg: { views: true },
      _max: { views: true },
      _min: { views: true },
    });

    return {
      totalOffers,
      offersWithViews,
      offersWithAddresses,
      offersWithCoordinates,
      viewsStats: {
        average: viewsStats._avg.views || 0,
        maximum: viewsStats._max.views || 0,
        minimum: viewsStats._min.views || 0,
      },
    };
  }

  private buildWhereClause(query: HeatmapQuery): Record<string, any> {
    const where: Record<string, any> = {};

    if (query.city) {
      where.city = {
        contains: query.city,
        mode: 'insensitive',
      };
    }

    if (query.district) {
      where.district = {
        contains: query.district,
        mode: 'insensitive',
      };
    }

    if (query.minPrice || query.maxPrice) {
      const priceFilter: Record<string, any> = {};
      if (query.minPrice) priceFilter.gte = query.minPrice;
      if (query.maxPrice) priceFilter.lte = query.maxPrice;
      where.price = priceFilter;
    }

    if (query.minViews || query.maxViews) {
      const viewsFilter: Record<string, any> = {};
      if (query.minViews) viewsFilter.gte = query.minViews;
      if (query.maxViews) viewsFilter.lte = query.maxViews;
      where.views = viewsFilter;
    }

    if (query.buildingType) {
      where.buildingType = query.buildingType as BuildingType;
    }

    if (query.minPricePerSqm || query.maxPricePerSqm) {
      const andConditions = (where.AND as any[]) || [];

      andConditions.push({
        price: { not: null },
        footage: { not: null, gt: 0 },
      });

      where.AND = andConditions;
    }

    return where;
  }

  private async generateUserMatchesHeatmap(
    query: HeatmapQuery,
    userId: number,
  ): Promise<HeatmapData> {
    this.logger.log(`Generating heatmap for user ${userId} matches`);

    const offerWhereClause = this.buildWhereClause(query);

    const alertWhereClause: { userId: number; id?: number } = { userId };
    if (query.alertId) {
      alertWhereClause.id = query.alertId;
      this.logger.log(`Filtering matches for alert ${query.alertId}`);
    }

    const matches = await this.databaseService.match.findMany({
      where: {
        alert: alertWhereClause,
        offer: {
          ...offerWhereClause,
          available: true,
          latitude: { not: null },
          longitude: { not: null },
        },
      },
      include: {
        offer: {
          select: {
            id: true,
            title: true,
            price: true,
            views: true,
            latitude: true,
            longitude: true,
            street: true,
            streetNumber: true,
            district: true,
            city: true,
            createdAt: true,
            available: true,
            footage: true,
            images: true,
            link: true,
          },
        },
      },
      orderBy: {
        matchedAt: 'desc',
      },
      take: Number(query.limit) || 5000,
    });

    this.logger.log(`Found ${matches.length} matches for user ${userId}`);

    // Create a map of offerId -> matchId for quick lookup
    const offerIdToMatchId = new Map<number, number>();
    matches.forEach((match) => {
      offerIdToMatchId.set(match.offer.id, match.id);
    });

    const validOffers = matches
      .map((match) => match.offer)
      .filter(
        (offer) =>
          offer.available &&
          offer.latitude !== null &&
          offer.longitude !== null,
      );

    if (validOffers.length === 0) {
      return {
        points: [],
        avgViews: 0,
        minViews: 0,
        totalOffers: 0,
        avgViewsPerDay: 0,
        maxViewsPerDay: 0,
        minViewsPerDay: 0,
      };
    }

    const viewsCounts = validOffers.map((offer) => offer.views);
    const avgViews =
      viewsCounts.reduce((sum, val) => sum + val, 0) / viewsCounts.length;
    const minViews = Math.min(...viewsCounts);

    const viewsPerDayList = validOffers.map((offer) =>
      this.calculateViewsPerDay(offer.views, offer.createdAt),
    );
    const maxViewsPerDay = Math.max(...viewsPerDayList);
    const minViewsPerDay = Math.min(...viewsPerDayList);
    const avgViewsPerDay =
      viewsPerDayList.reduce((sum, val) => sum + val, 0) /
      viewsPerDayList.length;

    const offersWithPricePerSqm = validOffers.filter(
      (offer) =>
        offer.price &&
        offer.footage &&
        Number(offer.price) > 0 &&
        Number(offer.footage) > 0,
    );

    const pricesPerSqm = offersWithPricePerSqm.map((offer) => {
      const price = Number(offer.price);
      const footage = Number(offer.footage);
      return price / footage;
    });

    const maxPricePerSqm =
      pricesPerSqm.length > 0 ? Math.max(...pricesPerSqm) : undefined;
    const minPricePerSqm =
      pricesPerSqm.length > 0 ? Math.min(...pricesPerSqm) : undefined;
    const avgPricePerSqm =
      pricesPerSqm.length > 0
        ? pricesPerSqm.reduce((sum, val) => sum + val, 0) / pricesPerSqm.length
        : undefined;

    const densityRadius = 0.01;
    const densityMap = new Map<number, number>();

    validOffers.forEach((offer, index) => {
      if (offer.latitude === null || offer.longitude === null) {
        return;
      }

      const lat = Number(offer.latitude);
      const lng = Number(offer.longitude);
      let nearbyCount = 0;

      validOffers.forEach((otherOffer) => {
        if (otherOffer.latitude === null || otherOffer.longitude === null) {
          return;
        }

        const otherLat = Number(otherOffer.latitude);
        const otherLng = Number(otherOffer.longitude);

        const distance = Math.sqrt(
          Math.pow(lat - otherLat, 2) + Math.pow(lng - otherLng, 2),
        );

        if (distance <= densityRadius) {
          nearbyCount++;
        }
      });

      densityMap.set(index, nearbyCount);
    });

    const densityCounts = Array.from(densityMap.values());
    const maxDensity =
      densityCounts.length > 0 ? Math.max(...densityCounts) : undefined;
    const minDensity =
      densityCounts.length > 0 ? Math.min(...densityCounts) : undefined;
    const avgDensity =
      densityCounts.length > 0
        ? densityCounts.reduce((sum, val) => sum + val, 0) /
          densityCounts.length
        : undefined;

    const offersWithFootage = validOffers.filter(
      (offer) => offer.footage && Number(offer.footage) > 0,
    );

    const footages = offersWithFootage.map((offer) => Number(offer.footage));
    const maxFootage = footages.length > 0 ? Math.max(...footages) : undefined;
    const minFootage = footages.length > 0 ? Math.min(...footages) : undefined;
    const avgFootage =
      footages.length > 0
        ? footages.reduce((sum, val) => sum + val, 0) / footages.length
        : undefined;

    const points: HeatmapPoint[] = [];
    const bounds = {
      north: -90,
      south: 90,
      east: -180,
      west: 180,
    };

    for (const [index, offer] of validOffers.entries()) {
      if (offer.latitude !== null && offer.longitude !== null) {
        const viewsPerDay = this.calculateViewsPerDay(
          offer.views,
          offer.createdAt,
        );

        const intensity =
          maxViewsPerDay > minViewsPerDay
            ? (viewsPerDay - minViewsPerDay) / (maxViewsPerDay - minViewsPerDay)
            : 1;

        const pricePerSqm =
          offer.price && offer.footage && Number(offer.footage) > 0
            ? Number(offer.price) / Number(offer.footage)
            : undefined;

        const offerDensity = densityMap.get(index) || 1;

        const point: HeatmapPoint = {
          lat: Number(offer.latitude),
          lng: Number(offer.longitude),
          intensity: Math.max(0.1, intensity),
          weight: offer.views,
          offerId: offer.id,
          matchId: offerIdToMatchId.get(offer.id),
          title: offer.title,
          price: offer.price ? Number(offer.price) : undefined,
          footage: offer.footage ? Number(offer.footage) : undefined,
          pricePerSqm: pricePerSqm,
          offerDensity: offerDensity,
          viewsPerDay: viewsPerDay,
          address:
            offer.street && offer.streetNumber
              ? `${offer.street} ${offer.streetNumber}`
              : offer.district || offer.city,
          images: offer.images || [],
          link: offer.link,
        };

        points.push(point);

        bounds.north = Math.max(bounds.north, point.lat);
        bounds.south = Math.min(bounds.south, point.lat);
        bounds.east = Math.max(bounds.east, point.lng);
        bounds.west = Math.min(bounds.west, point.lng);
      }
    }

    this.logger.log(
      `Generated ${points.length} heatmap points from user matches`,
    );

    return {
      points,
      avgViews,
      minViews,
      totalOffers: validOffers.length,
      maxPricePerSqm,
      minPricePerSqm,
      avgPricePerSqm,
      maxDensity,
      minDensity,
      avgDensity,
      maxFootage,
      minFootage,
      avgFootage,
      avgViewsPerDay,
      maxViewsPerDay,
      minViewsPerDay,
      bounds: points.length > 0 ? bounds : undefined,
    };
  }

  private async getUserMatchesStats(userId: number) {
    this.logger.log(`Getting heatmap stats for user ${userId} matches`);

    const totalMatches = await this.databaseService.match.count({
      where: {
        alert: {
          userId,
        },
      },
    });

    const matchesWithViews = await this.databaseService.match.count({
      where: {
        alert: {
          userId,
        },
        offer: {
          available: true,
          views: { gt: 0 },
        },
      },
    });

    const matchesWithAddresses = await this.databaseService.match.count({
      where: {
        alert: {
          userId,
        },
        offer: {
          available: true,
          OR: [{ street: { not: '' } }, { district: { not: '' } }],
        },
      },
    });

    const matchesWithCoordinates = await this.databaseService.match.count({
      where: {
        alert: {
          userId,
        },
        offer: {
          available: true,
          latitude: { not: null },
          longitude: { not: null },
        },
      },
    });

    const matchesWithOfferViews = await this.databaseService.match.findMany({
      where: {
        alert: {
          userId,
        },
        offer: {
          available: true,
          views: { gt: 0 },
        },
      },
      select: {
        offer: {
          select: {
            views: true,
          },
        },
      },
    });

    const viewsCounts = matchesWithOfferViews.map((match) => match.offer.views);
    const viewsStats =
      viewsCounts.length > 0
        ? {
            average:
              viewsCounts.reduce((sum, views) => sum + views, 0) /
              viewsCounts.length,
            maximum: Math.max(...viewsCounts),
            minimum: Math.min(...viewsCounts),
          }
        : {
            average: 0,
            maximum: 0,
            minimum: 0,
          };

    return {
      totalOffers: totalMatches,
      offersWithViews: matchesWithViews,
      offersWithAddresses: matchesWithAddresses,
      offersWithCoordinates: matchesWithCoordinates,
      viewsStats,
      userContext: {
        userId,
        isUserSpecific: true,
        description: 'Statistics based on user matches',
      },
    };
  }
}
