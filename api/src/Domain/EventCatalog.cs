using System;
using System.Collections.Generic;

namespace EventManagement.Domain
{
    public static class EventRepository
    {
        public static readonly List<IEvent> Events = new List<IEvent>
        {
            new Event(
                Guid.NewGuid(),
                "Microsoft Build 2025",
                "Microsoft’s flagship developer conference with ~300 sessions on Azure, .NET, AI, etc.",
                new DateTimeOffset(2025, 5, 21, 9, 0, 0, TimeSpan.Zero),
                2
            ),
            new Event(
                Guid.NewGuid(),
                "Microsoft Build 2026",
                "Annual Microsoft developer conference focusing on .NET 10, AI tooling, and Azure cloud.",
                new DateTimeOffset(2026, 5, 19, 9, 0, 0, TimeSpan.Zero),
                200
            ),
            new Event(
                Guid.NewGuid(),
                "Microsoft Ignite 2025",
                "Tech event for IT and developers focusing on AI security, governance, and cloud innovations.",
                new DateTimeOffset(2025, 11, 18, 9, 0, 0, TimeSpan.Zero),
                25
            ),
            new Event(
                Guid.NewGuid(),
                "Microsoft Ignite 2026",
                "Major Microsoft conference on AI, security, and cloud technologies.",
                new DateTimeOffset(2026, 11, 17, 9, 0, 0, TimeSpan.Zero),
                25
            ),
            new Event(
                Guid.NewGuid(),
                ".NET Conf 2025",
                "Free 3-day virtual event celebrating .NET 9 with 100+ sessions on C#, .NET, and Blazor.",
                new DateTimeOffset(2025, 11, 12, 15, 0, 0, TimeSpan.Zero),
                100
            ),
            new Event(
                Guid.NewGuid(),
                ".NET Conf 2026",
                "Free online conference for the release of .NET 10 with global developer participation.",
                new DateTimeOffset(2026, 11, 11, 15, 0, 0, TimeSpan.Zero),
                100
            ),
            new Event(
                Guid.NewGuid(),
                "Azure Dev Summit 2026",
                "Lisbon conference for Azure, .NET, and AI developers with 100+ talks and 68+ speakers.",
                new DateTimeOffset(2026, 10, 13, 9, 0, 0, TimeSpan.Zero),
                5
            ),
            new Event(
                Guid.NewGuid(),
                "AWS re:Invent 2025",
                "Amazon Web Services’ flagship cloud conference featuring keynotes on generative AI and new services.",
                new DateTimeOffset(2025, 12, 2, 9, 0, 0, TimeSpan.Zero),
                60
            ),
            new Event(
                Guid.NewGuid(),
                "AWS Summit New York City 2026",
                "AWS Summit focusing on cloud innovation and agentic AI, with product reveals and best practices.",
                new DateTimeOffset(2026, 7, 15, 9, 0, 0, TimeSpan.Zero),
                10
            ),
            new Event(
                Guid.NewGuid(),
                "AWS Summit Japan 2026",
                "Japan’s largest AWS learning event with keynotes and 160+ sessions on cloud, data, and AI.",
                new DateTimeOffset(2026, 6, 25, 9, 0, 0, TimeSpan.Zero),
                20
            ),
            new Event(
                Guid.NewGuid(),
                "AWS Summit Washington DC 2026",
                "Public-sector cloud conference with 340+ sessions on generative AI and cloud solutions.",
                new DateTimeOffset(2026, 6, 10, 9, 0, 0, TimeSpan.Zero),
                15
            ),
            new Event(
                Guid.NewGuid(),
                "Data + AI Summit 2026",
                "Databricks conference with 700+ sessions on analytics, machine learning, and AI.",
                new DateTimeOffset(2026, 6, 9, 9, 0, 0, TimeSpan.Zero),
                10
            ),
            new Event(
                Guid.NewGuid(),
                "Data + AI Summit 2026",
                "Databricks event on unified data and AI platforms, generative AI, and innovation.",
                new DateTimeOffset(2026, 6, 15, 9, 0, 0, TimeSpan.Zero),
                10
            ),
            new Event(
                Guid.NewGuid(),
                "The AI Conference 2026",
                "Vendor-neutral AI summit covering AGI, LLMs, generative AI, and ethics.",
                new DateTimeOffset(2026, 9, 17, 9, 0, 0, TimeSpan.Zero),
                3
            ),
            new Event(
                Guid.NewGuid(),
                "ODSC East 2026",
                "Open Data Science Conference focusing on machine learning and generative AI.",
                new DateTimeOffset(2026, 4, 22, 9, 0, 0, TimeSpan.Zero),
                4
            ),
            new Event(
                Guid.NewGuid(),
                "Google I/O 2025",
                "Google developer conference introducing Gemini AI features for Search and Workspace.",
                new DateTimeOffset(2025, 5, 14, 9, 0, 0, TimeSpan.Zero),
                7
            ),
            new Event(
                Guid.NewGuid(),
                "NVIDIA GTC 2026",
                "NVIDIA AI developer conference on agentic AI, robotics, and GPU computing.",
                new DateTimeOffset(2026, 3, 16, 9, 0, 0, TimeSpan.Zero),
                15
            ),
            new Event(
                Guid.NewGuid(),
                "GenAI Summit Silicon Valley 2025",
                "Generative AI conference with 10,+ attendees and 150 speakers exploring LLMs and AI agents.",
                new DateTimeOffset(2025, 11, 1, 9, 0, 0, TimeSpan.Zero),
                10
            ),
            new Event(
                Guid.NewGuid(),
                "GenAI Summit Paris 2026",
                "AI summit on LLMs, on-chain AI agents, DePIN, and Web3 with ~5, attendees.",
                new DateTimeOffset(2026, 10, 24, 9, 0, 0, TimeSpan.Zero),
                5
            ),
            new Event(
                Guid.NewGuid(),
                "LangChain Interrupt 2026",
                "AI agent builders conference with workshops and talks on LangChain and practical AI applications.",
                new DateTimeOffset(2026, 5, 13, 9, 0, 0, TimeSpan.Zero),
                2
            ),
            new Event(
                Guid.NewGuid(),
                "OpenAI DevDay 2026",
                "Third annual developer conference featuring keynotes and sessions on new models and APIs.",
                new DateTimeOffset(2026, 10, 6, 9, 0, 0, TimeSpan.Zero),
                1500
            ),
            new Event(
                Guid.NewGuid(),
                "Code with Claude 2026",
                "Anthropic one-day hackathon-style developer conference with hands-on labs and workshops.",
                new DateTimeOffset(2026, 5, 22, 9, 0, 0, TimeSpan.Zero),
                800
            ),
            new Event(
                Guid.NewGuid(),
                "London Builder Summit 2026",
                "Anthropic AI summit exploring next-gen AI innovation with Claude models and tools.",
                new DateTimeOffset(2026, 10, 1, 9, 0, 0, TimeSpan.Zero),
                1200
            ),
            new Event(
                Guid.NewGuid(),
                "Tokyo Builder Summit 2026",
                "Anthropic AI event for Japan’s AI community focused on Claude and AI innovation.",
                new DateTimeOffset(2026, 10, 28, 9, 0, 0, TimeSpan.Zero),
                1
            ),
            new Event(
                Guid.NewGuid(),
                "Node Congress 2026",
                "Online JavaScript backend summit with workshops on Node.js, serverless, and edge computing.",
                new DateTimeOffset(2026, 4, 17, 9, 0, 0, TimeSpan.Zero),
                5
            ),
            new Event(
                Guid.NewGuid(),
                "Node.js Global Summit 2026",
                "Virtual summit on Node.js and generative AI with case studies and best practices.",
                new DateTimeOffset(2026, 4, 8, 9, 0, 0, TimeSpan.Zero),
                4
            )
            ,
            // Small local event intentionally seeded as full for UI testing
            new Event(
                Guid.NewGuid(),
                "Local Meetup Full",
                "This event is intentionally seeded as full to test capacity UI states.",
                new DateTimeOffset(2026, 1, 10, 18, 0, 0, TimeSpan.Zero),
                2
            )
        };
    }
}
