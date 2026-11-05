export type LogLink = { ask: string; q: string };

/** Ready-made searches shown on each alert. They point the way and never reveal the answer. */
export const LOG_LINKS: Record<string, LogLink[]> = {
  "SL-1001": [
    { ask: "What did d.okafor's account do around the time of the email?", q: "user:d.okafor" },
    { ask: "Did d.okafor send anything to the fake login page?", q: "user:d.okafor event:post" },
    { ask: "What else did the sender's address do?", q: "src:203.0.113.140" },
  ],
  "SL-1002": [
    { ask: "What did m.silva do after the email arrived?", q: "user:m.silva" },
    { ask: "Who else connected to the newsletter's tracking site?", q: "freightline-news.test" },
  ],
  "SL-1003": [
    { ask: "Everything this address did. How many attempts, and how did it end?", q: "src:203.0.113.58" },
    { ask: "Did any attempt succeed? Which account?", q: "src:203.0.113.58 event:ok" },
    { ask: "What did the admin account do on the server?", q: "host:web-bastion-02 user:admin" },
  ],
  "SL-1004": [{ ask: "What did the scanner do, and from where?", q: "src:10.20.9.5" }],
  "SL-1005": [
    { ask: "How often did the workstation try to reach the blocked address?", q: "dst:198.51.100.200" },
    { ask: "What ran on the workstation?", q: "host:FIN-WS-114" },
  ],
  "SL-1006": [
    { ask: "What did l.fernandes do before and after opening the file?", q: "user:l.fernandes" },
    { ask: "Which programs ran on the computer?", q: "host:HR-WS-052" },
    { ask: "Who talked to the address the malware called?", q: "192.0.2.88" },
  ],
  "SL-1007": [{ ask: "What happened on the lab computer?", q: "host:SEC-LAB-03" }],
  "SL-1008": [
    { ask: "Every request this address sent to the web firewall", q: "source:waf src:203.0.113.91" },
    { ask: "Were all of them blocked?", q: "source:waf src:203.0.113.91 event:blocked" },
  ],
  "SL-1009": [
    { ask: "What did s.menon sign in from?", q: "user:s.menon" },
    { ask: "Who else used this address?", q: "src:192.0.2.150" },
  ],
  "SL-1010": [
    { ask: "How many prompts did a.kapoor get, and when?", q: "user:a.kapoor" },
    { ask: "What else did the address behind the prompts do?", q: "src:203.0.113.210" },
  ],
  "SL-1012": [
    { ask: "What did j.mercer do before the upload?", q: "user:j.mercer" },
    { ask: "Who else visited the file-sharing site?", q: "filedrop-personal.test" },
  ],
  "SL-1013": [
    { ask: "What did d.rossi do that night?", q: "user:d.rossi" },
    { ask: "What happened on the database server?", q: "host:db-prod-01" },
  ],
  "SL-1014": [
    { ask: "Where else has this address appeared?", q: "src:203.0.113.140" },
    { ask: "Which sign-ins does d.okafor's account have?", q: "user:d.okafor source:identity" },
  ],
  "SL-1015": [
    { ask: "What did this account do, and from where?", q: "user:svc_bi_report" },
    { ask: "What else did the new address do?", q: "src:203.0.113.166" },
  ],
  "SL-1016": [
    { ask: "What did the service account do that night?", q: "user:svc-patch" },
    { ask: "What happened on the jump server?", q: "host:JUMP-ADM-01" },
  ],
  "SL-1017": [
    { ask: "Everything r.pillai's account and laptop did", q: "user:r.pillai" },
    { ask: "Who else connected to the personal storage site?", q: "cloudbox-personal.test" },
  ],
  "SL-1018": [
    { ask: "Where did r.dsouza's sign-in attempts come from?", q: "user:r.dsouza" },
    { ask: "Did the failures come from anywhere else?", q: "user:r.dsouza event:failed" },
  ],
  "SL-1019": [
    { ask: "What did m.pillai's computer do around the download?", q: "user:m.pillai" },
    { ask: "Who else connected to the download site?", q: "zoom-installer-download.test" },
  ],
  "SL-1020": [
    { ask: "Everything the uploading address did", q: "src:198.51.100.141" },
  ],
  "SL-1021": [
    { ask: "What did the second address do?", q: "src:203.0.113.178" },
    { ask: "Everything t.venkat's session did", q: "user:t.venkat" },
  ],
  "SL-1022": [
    { ask: "Everything the attacking address did", q: "src:203.0.113.87" },
    { ask: "What the web application account read", q: "host:xfer-db-01" },
  ],
  "SL-1023": [
    { ask: "Everything sent by the scanning address", q: "src:198.51.100.208" },
    { ask: "Did anything call 203.0.113.45?", q: "203.0.113.45" },
  ],
  "SL-1024": [
    { ask: "Everything on a.menon's account", q: "user:a.menon" },
    { ask: "What the new address did", q: "src:192.0.2.64" },
  ],
  "SL-1025": [
    { ask: "Everything the spraying address did", q: "src:198.51.100.219" },
    { ask: "What e.mathew's account did", q: "user:e.mathew" },
  ],
  "SL-1026": [
    { ask: "Who contacted the new domain?", q: "api-voxline-cdn.test" },
    { ask: "Everything on the first affected computer", q: "host:SALES-WS-027" },
  ],
  "SL-1027": [
    { ask: "Everything on the file server", q: "host:FS-02" },
    { ask: "What did the administrator account do?", q: "user:adm.rkulkarni" },
  ],
  "SL-1028": [
    { ask: "Everything the new address did", q: "src:203.0.113.99" },
  ],
  "SL-1029": [
    { ask: "Everything on p.rao's account", q: "user:p.rao" },
    { ask: "What did the app's address do?", q: "src:198.51.100.188" },
  ],
  "SL-1030": [
    { ask: "DNS lookups from the laptop", q: "host:LEG-WS-012" },
    { ask: "Who else queried this domain?", q: "shieldsense-cloud.test" },
  ],
  "SL-1031": [
    { ask: "Everything this address did", q: "src:198.51.100.231" },
    { ask: "Every lookup the bot made", q: "lookup_shipments" },
  ],
  "SL-1032": [
    { ask: "Email from the look-alike domain", q: "harborpine-pay.test" },
  ],
  "SL-1033": [
    { ask: "Everything on d.kamath's account", q: "user:d.kamath" },
    { ask: "What did the new address do?", q: "src:203.0.113.118" },
  ],
  "SL-1034": [
    { ask: "Uploads to the AI workspace", q: "lumen-workspace.test" },
  ],
  "SL-1035": [
    { ask: "Everything the new address did", q: "src:203.0.113.250" },
    { ask: "Every call using the key", q: "user:svc-ds-summariser" },
  ],
  "SL-1036": [
    { ask: "What did the assistant do for m.sharma?", q: "user:m.sharma" },
    { ask: "Mail sent to the new domain", q: "docsync-archive.test" },
  ],
  "SL-1037": [
    { ask: "Everything on the first computer", q: "host:FIN-WS-044" },
    { ask: "Email from the sender domain", q: "freightdocs-portal.test" },
  ],
  "SL-1038": [
    { ask: "Everything sent to the add-on's domain", q: "api.sumly-ai.test" },
    { ask: "Everything l.gupta did", q: "user:l.gupta" },
  ],
  "SL-1039": [
    { ask: "What did v.joshi do on the file server?", q: "user:v.joshi" },
    { ask: "Everything that ran on SRV-FS-03", q: "host:SRV-FS-03" },
  ],
  "SL-1040": [
    { ask: "What did the backup account run on FS-02?", q: "host:FS-02" },
    { ask: "Where else did the backup account delete shadow copies?", q: "user:svc-backup" },
  ],
  "SL-1041": [
    { ask: "What happened on HR-WS-019 after the install?", q: "host:HR-WS-019" },
    { ask: "What did the NorthPDF update site get?", q: "updates.northpdf.test" },
  ],
  "SL-1042": [
    { ask: "Everything this visitor did on the shop", q: "src:198.51.100.206" },
    { ask: "All WAF events for the shop", q: "shop.harborpine.test" },
  ],
  "SL-1043": [
    { ask: "What did the service account do?", q: "user:svc-mfp-mail" },
    { ask: "What else came from the printer's address?", q: "src:10.20.60.23" },
  ],
  "SL-1044": [
    { ask: "Everyone who visited the new domain", q: "brightlane-campaign.test" },
    { ask: "What did r.kulkarni do?", q: "user:r.kulkarni" },
  ],
  "SL-1045": [
    { ask: "Everything from the testing address", q: "src:203.0.113.55" },
    { ask: "What did the WAF block on the portal?", q: "portal.harborpine.test" },
  ],
  "SL-1047": [
    { ask: "Everything BKP-REPO-01 sent that night", q: "src:10.20.8.40" },
    { ask: "Everything to the backup provider's address", q: "dst:203.0.113.171" },
  ],
  "SL-1048": [
    { ask: "All mail from the marketing sender", q: "user:marketing@harborpine.test" },
    { ask: "Everything from the platform's addresses", q: "src:198.51.100.150" },
  ],
  "SL-1049": [
    { ask: "Everything p.dutta did", q: "user:p.dutta" },
    { ask: "What happened on the Project-Atlas site?", q: "Project-Atlas" },
  ],
  "SL-1050": [
    { ask: "What did the embedding key do?", q: "user:svc-ds-embeddings" },
    { ask: "Everything from the first cluster node", q: "src:10.20.12.31" },
  ],
  "SL-1051": [
    { ask: "What did the assistant do for n.kulkarni?", q: "user:n.kulkarni" },
    { ask: "Everything sent to the partner's domain", q: "partner-ardent.test" },
  ],
};
