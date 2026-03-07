const Laboratory = require("../models/laboratory");
const mongoose = require("mongoose");

exports.AddLaboratoryDetails = async (req, res) => {
  try {
    const userId = req.user._id;
    const {
      labName,
      ownerName,
      licenseNumber,
      isApproved,
      labEmail,
      labPhoneNumber,
      address,
      city,
      location,
      pinLocation,
      workingHours,
      openHours,
      title,
      description,
      testsOffered,
      homeSampleAvailable,
    } = req.body;
    const existingProfile = await Laboratory.findOne({ user: userId }).populate(
      "user",
      "name email phoneNumber role createdAt",
    );
    if (existingProfile) {
      existingProfile.labName = labName;
      existingProfile.ownerName = ownerName;
      existingProfile.licenseNumber = licenseNumber;
      existingProfile.isApproved = isApproved;
      existingProfile.labEmail = labEmail;
      existingProfile.labPhoneNumber = labPhoneNumber;
      existingProfile.address = address;
      existingProfile.city = city;
      if (location) existingProfile.location = location;
      if (
        pinLocation &&
        typeof pinLocation.lat === "number" &&
        typeof pinLocation.lng === "number"
      ) {
        existingProfile.location = {
          type: "Point",
          coordinates: [pinLocation.lng, pinLocation.lat],
        };
      }
      existingProfile.workingHours = workingHours || openHours || existingProfile.workingHours;
      existingProfile.testsOffered = testsOffered;
      existingProfile.title = title ?? existingProfile.title;
      existingProfile.description = description ?? existingProfile.description;
      if (typeof homeSampleAvailable === "boolean")
        existingProfile.homeSampleAvailable = homeSampleAvailable;
      await existingProfile.save();
      return res.status(200).json({
        message: "Laboratory Updated Successfully",
        existingProfile,
        success: true,
      });
    }
    const lab = await Laboratory.create({
      user: userId,
      labName,
      ownerName,
      licenseNumber,
      isApproved: isApproved ?? false,
      labEmail,
      labPhoneNumber,
      address,
      city,
      location,
      workingHours: workingHours || openHours || null,
      title,
      description,
      testsOffered: testsOffered ?? [],
      homeSampleAvailable: homeSampleAvailable ?? false,
    });
    const full = await Laboratory.findById(lab._id).populate(
      "user",
      "name email role phoneNunber createdAt",
    );
    return res.status(201).json({
      message: "Laboratory created successfully",
      laboratory: full,
      success: true,
    });
  } catch (error) {
    console.error("AddLaboratoryDetails Error:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

exports.getAllLaboratories = async (req, res) => {
  try {
    const labs = await Laboratory.find().populate(
      "user",
      "name email role phoneNumber",
    );
    res.status(200).json({ success: true, laboratories: labs });
  } catch (error) {
    console.error("Get All Laboratories Error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

exports.FilterLaboratories = async (req, res) => {
  try {
    const { q, city, test, homeSample, lat, lng, radiusKm, minRating, sort } =
      req.query;
    const useGeo = lat && lng;
    const parsedHomeSample =
      typeof homeSample !== "undefined"
        ? String(homeSample).toLowerCase() === "true"
        : undefined;
    const parsedRadius = radiusKm ? Number(radiusKm) : 10;
    const pipeline = [];
    if (useGeo) {
      pipeline.push({
        $geoNear: {
          near: { type: "Point", coordinates: [Number(lng), Number(lat)] },
          distanceField: "distanceMeters",
          spherical: true,
          maxDistance: parsedRadius * 1000,
        },
      });
    } else {
      pipeline.push({ $match: {} });
    }
    const and = [];
    if (q) {
      and.push({
        $or: [
          { labName: { $regex: q, $options: "i" } },
          { title: { $regex: q, $options: "i" } },
          { description: { $regex: q, $options: "i" } },
        ],
      });
    }
    if (city) {
      and.push({ city: { $regex: city, $options: "i" } });
    }
    if (test) {
      and.push({ testsOffered: { $in: [test] } });
    }
    if (typeof parsedHomeSample === "boolean") {
      and.push({ homeSampleAvailable: parsedHomeSample });
    }
    if (and.length) pipeline.push({ $match: { $and: and } });
    pipeline.push({
      $addFields: {
        avgRating: {
          $cond: [
            { $gt: [{ $size: { $ifNull: ["$ratings", []] } }, 0] },
            { $avg: "$ratings" },
            null,
          ],
        },
      },
    });
    if (minRating) {
      pipeline.push({ $match: { avgRating: { $gte: Number(minRating) } } });
    }
    if (sort === "distance" && useGeo) {
      pipeline.push({ $sort: { distanceMeters: 1 } });
    } else if (sort === "rating") {
      pipeline.push({ $sort: { avgRating: -1 } });
    } else {
      pipeline.push({ $sort: { createdAt: -1 } });
    }
    pipeline.push({ $limit: 100 });
    const labs = await Laboratory.aggregate(pipeline);
    res
      .status(200)
      .json({ success: true, count: labs.length, laboratories: labs });
  } catch (error) {
    console.error("Filter Laboratories Error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

exports.getLaboratoryById = async (req, res) => {
  try {
    const { id } = req.params;
    const lab = await Laboratory.findById(id).populate(
      "user",
      "name email role phoneNumber createdAt",
    );
    if (!lab) {
      return res.status(404).json({ message: "Laboratory not found" });
    }
    res.status(200).json({ success: true, laboratory: lab });
  } catch (error) {
    console.error("Get Laboratory By Id Error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

exports.AddLaboratoryReview = async (req, res) => {
  try {
    const { id } = req.params;
    const { rating, review } = req.body;
    const lab = await Laboratory.findById(id);
    if (!lab) return res.status(404).json({ message: "Laboratory not found" });
    if (rating !== undefined) {
      const r = Number(rating);
      if (Number.isNaN(r) || r < 1 || r > 5) {
        return res
          .status(400)
          .json({ message: "Rating must be between 1 and 5" });
      }
      lab.ratings = Array.isArray(lab.ratings) ? [...lab.ratings, r] : [r];
    }
    if (review) {
      lab.reviews = Array.isArray(lab.reviews)
        ? [...lab.reviews, String(review)]
        : [String(review)];
    }
    await lab.save();
    res.status(200).json({ success: true, laboratory: lab });
  } catch (error) {
    console.error("Add Laboratory Review Error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};
