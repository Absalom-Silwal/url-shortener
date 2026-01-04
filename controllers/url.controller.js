import Url from "../models/url.model.js";
import bs58 from "bs58";

// shorten Url
export const shortUrl = async (req, res) => {
  try {
    const {url} = req.body;
    const dataToEncode = Buffer.from(url, 'utf8');
    const shorten_url = bs58.encode(dataToEncode);
    const urlDb = await Url.findOneAndUpdate({short_code:shorten_url},{long_url:url},{ new: true, upsert: true });
    res.status(201).json(urlDb);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

export const getUrlById = async (req, res) => {
  try {
    const url = await Url.find({short_code:req.params.id});
    if (!url) return res.status(404).json({ message: "Url not found" });
    res.status(200).json(user);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const deleteUrl = async (req, res) => {
  try {
    const deletedUser = await User.findByIdAndDelete(req.params.id);
    if (!deletedUser) return res.status(404).json({ message: "User not found" });
    res.status(200).json({ message: "User deleted successfully" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};