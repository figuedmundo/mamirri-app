# Product Roadmap

1. [ ] Patient Management Foundation — Basic CRUD for patient profiles and list view to manage the clinic's patient base. `S`
2. [ ] Authentication & Secure Access — Implementation of JWT-based login to ensure patient data privacy and security. `XS`
3. [ ] Voice-to-Text Clinical Notes — Integration with Whisper API to allow recording and transcribing clinical observations in real-time. `S`
4. [ ] Clinical Media Capture — Module for taking and securely storing patient photos (footprints/posture) with S3 integration. `M`
5. [ ] Structured Session Workflow — Implementation of the "Tunnel" UI for linear capture of anamnesis, exploration, and diagnosis. `M`
6. [ ] Knowledge Base Preparation (RAG) — Processing and indexing the "Biblia" of clinical books into a vector database for retrieval. `M`
7. [ ] AI Diagnostic Support — GPT-4o integration to cross-reference patient data with the indexed knowledge base for suggestions. `L`
8. [ ] Session Finalization & Summary — Feature to finalize sessions, making them immutable and generating a structured clinical summary. `S`

> Notes
> - Order items by technical dependencies: establishing the data structure and auth before AI features.
> - Each item represents an end-to-end functional feature, building from the core patient management to the advanced AI assistant.
