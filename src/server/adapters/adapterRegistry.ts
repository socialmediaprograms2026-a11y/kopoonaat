import { AffiliateNetworkAdapter } from "./AffiliateNetworkAdapter";
import { AmazonAssociatesAdapter } from "./AmazonAssociatesAdapter";
import { AwinAdapter } from "./AwinAdapter";
import { ImpactAdapter } from "./ImpactAdapter";
import { CJAdapter } from "./CJAdapter";
import { ShareASaleAdapter } from "./ShareASaleAdapter";
import { AdmitadAdapter } from "./AdmitadAdapter";
import { ArabClicksAdapter } from "./ArabClicksAdapter";
import { LinkArabyAdapter } from "./LinkArabyAdapter";
import { GenericNetworkAdapter } from "./GenericNetworkAdapter";

const adapters: Record<string, AffiliateNetworkAdapter> = {
  amazon: new AmazonAssociatesAdapter(),
  awin: new AwinAdapter(),
  impact: new ImpactAdapter(),
  cj: new CJAdapter(),
  shareasale: new ShareASaleAdapter(),
  admitad: new AdmitadAdapter(),
  arabclicks: new ArabClicksAdapter(),
  linkaraby: new LinkArabyAdapter(),
  generic: new GenericNetworkAdapter()
};

export function getAdapterForNetwork(networkNameOrKey: string): AffiliateNetworkAdapter {
  const normalized = (networkNameOrKey || "").toLowerCase();

  if (normalized.includes("linkaraby") || normalized.includes("لينك عربي")) return adapters.linkaraby;
  if (normalized.includes("amazon")) return adapters.amazon;
  if (normalized.includes("awin")) return adapters.awin;
  if (normalized.includes("impact")) return adapters.impact;
  if (normalized.includes("cj") || normalized.includes("commission junction")) return adapters.cj;
  if (normalized.includes("shareasale") || normalized.includes("share-a-sale")) return adapters.shareasale;
  if (normalized.includes("admitad")) return adapters.admitad;
  if (normalized.includes("arabclicks") || normalized.includes("dcm")) return adapters.arabclicks;

  return adapters.generic;
}

export function getAllAdapters(): AffiliateNetworkAdapter[] {
  return Object.values(adapters);
}
