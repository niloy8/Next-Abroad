from datetime import datetime
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from app.models.enums import SourceTier, OpportunityStatus, FundingType, DegreeLevel
from app.models.source import Source
from app.models.country import Country
from app.models.university import University, Program
from app.models.scholarship import Scholarship
from app.models.user import User
from app.utils.security import get_password_hash


async def seed_initial_data(db: AsyncSession):
    """Seed authentic, verified real-world universities, scholarships, and countries."""
    # Check if data already exists
    res = await db.execute(select(Country))
    if res.scalars().first():
        return  # Already seeded

    # 1. Countries
    countries_data = [
        Country(
            code="DE",
            name="Germany",
            currency="EUR",
            avg_tuition_min=0.0,
            avg_tuition_max=3000.0,
            avg_living_annual_min=10500.0,
            avg_living_annual_max=12500.0,
            visa_work_rights="140 full days or 280 half days per calendar year",
            post_study_work_visa="18-month job seeker residence permit",
            blocked_account_required=11904.0,
            popular_fields=["Computer Science", "Mechanical Engineering", "Automotive", "Data Science", "Physics"],
            flag_code="de",
            description="Tuition-free higher education at world-class public technical universities.",
        ),
        Country(
            code="SE",
            name="Sweden",
            currency="SEK",
            avg_tuition_min=90000.0,
            avg_tuition_max=145000.0,
            avg_living_annual_min=105000.0,
            avg_living_annual_max=130000.0,
            visa_work_rights="No strict hourly limit during term as long as academic progress is maintained",
            post_study_work_visa="12-month post-study work search visa",
            blocked_account_required=120000.0,
            popular_fields=["Sustainable Engineering", "Computer Science", "Biotechnology", "Business Analytics"],
            flag_code="se",
            description="Pioneer in sustainability, innovation, and high-quality English-taught Master's degrees.",
        ),
        Country(
            code="CH",
            name="Switzerland",
            currency="CHF",
            avg_tuition_min=1400.0,
            avg_tuition_max=2500.0,
            avg_living_annual_min=20000.0,
            avg_living_annual_max=26000.0,
            visa_work_rights="15 hours per week during term (after 6 months of residency)",
            post_study_work_visa="6-month post-study job seeker permit",
            blocked_account_required=21000.0,
            popular_fields=["Computer Science", "Robotics", "Quantum Engineering", "Finance", "Microtechnology"],
            flag_code="ch",
            description="World-leading research institutions with remarkably low public tuition fees and top global rankings.",
        ),
        Country(
            code="CA",
            name="Canada",
            currency="CAD",
            avg_tuition_min=22000.0,
            avg_tuition_max=42000.0,
            avg_living_annual_min=18000.0,
            avg_living_annual_max=24000.0,
            visa_work_rights="Up to 24 hours per week off-campus during academic sessions",
            post_study_work_visa="Up to 3-year Post-Graduation Work Permit (PGWP)",
            blocked_account_required=20635.0,
            popular_fields=["Applied Computing", "Artificial Intelligence", "Bioinformatics", "Civil Engineering"],
            flag_code="ca",
            description="Welcoming immigration pathways, globally recognized research, and strong post-study work opportunities.",
        ),
        Country(
            code="GB",
            name="United Kingdom",
            currency="GBP",
            avg_tuition_min=18000.0,
            avg_tuition_max=36000.0,
            avg_living_annual_min=12000.0,
            avg_living_annual_max=16000.0,
            visa_work_rights="20 hours per week during term-time",
            post_study_work_visa="2-year Graduate Route visa (3 years for PhD)",
            blocked_account_required=12200.0,
            popular_fields=["Advanced Computer Science", "Data & AI", "Finance", "Public Policy", "Biosciences"],
            flag_code="gb",
            description="Intensive 1-year Master's programs, historic universities, and strong global employer recognition.",
        ),
    ]
    for c in countries_data:
        db.add(c)
    await db.flush()

    # 2. Tier-1 Verified Sources
    sources_data = [
        Source(
            url="https://www.daad.de/en/study-and-research-in-germany/scholarships/daad-scholarships/helmut-schmidt/",
            title="DAAD Official Portal - Helmut-Schmidt-Programme",
            tier=SourceTier.TIER_1,
            organization="German Academic Exchange Service (DAAD)",
            domain="daad.de",
            is_verified=True,
            verification_notes="Verified against official DAAD Bonn funding database.",
        ),
        Source(
            url="https://erasmus-plus.ec.europa.eu/opportunities/opportunities-for-individuals/students/erasmus-mundus-joint-masters",
            title="European Commission Erasmus+ Joint Masters Catalogue",
            tier=SourceTier.TIER_1,
            organization="European Commission Directorate-General for Education",
            domain="ec.europa.eu",
            is_verified=True,
            verification_notes="Official EU executive agency portal.",
        ),
        Source(
            url="https://si.se/en/apply/scholarships/swedish-institute-scholarships-for-global-professionals/",
            title="Swedish Institute Scholarships for Global Professionals",
            tier=SourceTier.TIER_1,
            organization="Swedish Institute (Government of Sweden)",
            domain="si.se",
            is_verified=True,
            verification_notes="Verified via Swedish Ministry for Foreign Affairs agency portal.",
        ),
        Source(
            url="https://ethz.ch/students/en/studies/financial/scholarships/excellencescholarship.html",
            title="ETH Zurich Financial Aid & Excellence Scholarship (ESOP)",
            tier=SourceTier.TIER_1,
            organization="ETH Zurich Rectorate",
            domain="ethz.ch",
            is_verified=True,
            verification_notes="Official ETH Zurich graduate funding portal.",
        ),
        Source(
            url="https://www.tum.de/en/studies/degree-programs/detail/informatics-master-of-science-msc",
            title="Technical University of Munich (TUM) MSc Informatics Admissions",
            tier=SourceTier.TIER_1,
            organization="Technical University of Munich",
            domain="tum.de",
            is_verified=True,
            verification_notes="Official TUM degree catalog.",
        ),
        Source(
            url="https://www.chevening.org/scholarships/",
            title="Chevening Scholarships Official UK Portal",
            tier=SourceTier.TIER_1,
            organization="UK Foreign, Commonwealth and Development Office",
            domain="chevening.org",
            is_verified=True,
            verification_notes="Official UK government global scholarship scheme.",
        ),
    ]
    for s in sources_data:
        db.add(s)
    await db.flush()

    # 3. Universities & Programs
    tum = University(
        name="Technical University of Munich (TUM)",
        country="Germany",
        city="Munich",
        global_rank=28,
        type="Public",
        website_url="https://www.tum.de/en/",
        admissions_url="https://www.tum.de/en/studies/application",
        living_cost_annual=11500.0,
        currency="EUR",
        acceptance_rate=0.18,
        overview="Technical University of Munich is one of Europe's leading technical universities, committed to excellence in research and teaching, interdisciplinary education, and the active promotion of young scientists.",
        source_id=sources_data[4].id,
    )
    db.add(tum)
    await db.flush()

    tum_p1 = Program(
        university_id=tum.id,
        name="M.Sc. in Informatics (Computer Science)",
        degree_level=DegreeLevel.MASTERS,
        field_of_study="Computer Science",
        duration_months=24,
        tuition_annual=0.0,
        currency="EUR",
        language="English",
        min_cgpa=3.2,
        grading_scale=4.0,
        min_ielts=6.5,
        min_toefl=88.0,
        gre_required=False,
        intake="Fall 2026",
        application_deadline="2026-05-31",
        status=OpportunityStatus.OPEN,
        application_url="https://campus.tum.de/",
        overview="Covers software engineering, algorithms, scientific computing, and artificial intelligence with flexible specializations.",
    )
    tum_p2 = Program(
        university_id=tum.id,
        name="M.Sc. in Data Engineering and Analytics",
        degree_level=DegreeLevel.MASTERS,
        field_of_study="Data Science",
        duration_months=24,
        tuition_annual=0.0,
        currency="EUR",
        language="English",
        min_cgpa=3.3,
        grading_scale=4.0,
        min_ielts=6.5,
        min_toefl=90.0,
        gre_required=False,
        intake="Fall 2026",
        application_deadline="2026-05-31",
        status=OpportunityStatus.OPEN,
        application_url="https://campus.tum.de/",
        overview="Interdisciplinary program between mathematics and informatics focusing on scalable data systems, big data analytics, and machine learning.",
    )
    db.add(tum_p1)
    db.add(tum_p2)

    eth = University(
        name="ETH Zurich",
        country="Switzerland",
        city="Zurich",
        global_rank=7,
        type="Public",
        website_url="https://ethz.ch/en.html",
        admissions_url="https://ethz.ch/en/studies/master/application.html",
        living_cost_annual=22000.0,
        currency="CHF",
        acceptance_rate=0.22,
        overview="Consistently ranked among the top 10 universities in the world. Renowned for cutting-edge engineering, science, and computer science breakthroughs.",
        source_id=sources_data[3].id,
    )
    db.add(eth)
    await db.flush()

    eth_p1 = Program(
        university_id=eth.id,
        name="Master of Science in Computer Science",
        degree_level=DegreeLevel.MASTERS,
        field_of_study="Computer Science",
        duration_months=24,
        tuition_annual=1460.0,
        currency="CHF",
        language="English",
        min_cgpa=3.6,
        grading_scale=4.0,
        min_ielts=7.0,
        min_toefl=100.0,
        gre_required=True,
        intake="Fall 2026",
        application_deadline="2026-12-15",
        status=OpportunityStatus.UPCOMING,
        application_url="https://ethz.ch/en/studies/master/application.html",
        overview="Provides deep theoretical foundations combined with practical research in distributed systems, machine intelligence, cyber security, and visual computing.",
    )
    db.add(eth_p1)

    uu = University(
        name="Uppsala University",
        country="Sweden",
        city="Uppsala",
        global_rank=105,
        type="Public",
        website_url="https://www.uu.se/en",
        admissions_url="https://www.universityadmissions.se",
        living_cost_annual=115000.0,
        currency="SEK",
        acceptance_rate=0.35,
        overview="Founded in 1477, Uppsala is the oldest university in Sweden and the Nordic countries, recognized for pioneering international research and dynamic student life.",
        source_id=sources_data[2].id,
    )
    db.add(uu)
    await db.flush()

    uu_p1 = Program(
        university_id=uu.id,
        name="Master's Programme in Computer Science",
        degree_level=DegreeLevel.MASTERS,
        field_of_study="Computer Science",
        duration_months=24,
        tuition_annual=145000.0,
        currency="SEK",
        language="English",
        min_cgpa=3.0,
        grading_scale=4.0,
        min_ielts=6.5,
        min_toefl=90.0,
        gre_required=False,
        intake="Autumn 2026",
        application_deadline="2026-01-15",
        status=OpportunityStatus.EXPIRED,
        application_url="https://www.universityadmissions.se",
        overview="Specialized tracks in computer architecture, data science, human-computer interaction, and software engineering.",
    )
    db.add(uu_p1)

    # 4. Scholarships
    sch1 = Scholarship(
        name="DAAD Helmut-Schmidt-Programme (Master's in Public Policy and Governance)",
        provider="German Academic Exchange Service (DAAD)",
        country="Germany",
        university_id=None,
        degree_level=DegreeLevel.MASTERS,
        eligible_fields=["Public Policy", "Economics", "Political Science", "Social Sciences", "International Relations"],
        funding_type=FundingType.FULLY_FUNDED,
        tuition_coverage_pct=100.0,
        monthly_stipend=934.0,
        stipend_currency="EUR",
        travel_support=True,
        travel_allowance_amount=1200.0,
        accommodation_support=True,
        health_insurance=True,
        min_cgpa=3.0,
        grading_scale=4.0,
        min_ielts=6.5,
        min_toefl=85.0,
        eligible_nationalities=["Developing Countries", "Bangladesh", "India", "Pakistan", "Nigeria", "Kenya", "Ghana", "Indonesia", "Brazil"],
        work_experience_years_required=1.0,
        required_documents=[
            "Official DAAD Application Form",
            "Hand-signed Curriculum Vitae (Europass)",
            "Letter of Motivation (max 2 pages)",
            "Certified Academic Degree Certificates and Transcripts",
            "Proof of English Language Proficiency",
            "Written reference from current employer/university",
        ],
        application_steps=[
            "Select up to two participating Master courses in Germany",
            "Prepare all certified English/German translations of transcripts",
            "Submit application directly to the selected universities during the open window",
            "Shortlisted candidates undergo selection committee review",
        ],
        application_open_date="2026-06-01",
        application_deadline="2026-07-31",
        status=OpportunityStatus.UPCOMING,
        status_reason="Verified upcoming application window for 2027 intake.",
        official_application_url="https://www.daad.de/en/study-and-research-in-germany/scholarships/daad-scholarships/helmut-schmidt/",
        source_id=sources_data[0].id,
        overview="The DAAD Helmut-Schmidt-Programme offers future leaders from developing countries the chance to acquire a Master's degree in subjects with special relevance to the social, political, and economic development of their home countries.",
    )
    db.add(sch1)

    sch2 = Scholarship(
        name="Erasmus Mundus Joint Master Degrees (EMJM) Scholarship",
        provider="European Commission",
        country="European Union",
        university_id=None,
        degree_level=DegreeLevel.MASTERS,
        eligible_fields=["Computer Science", "Artificial Intelligence", "Data Science", "Cybersecurity", "Environmental Engineering", "All Fields"],
        funding_type=FundingType.FULLY_FUNDED,
        tuition_coverage_pct=100.0,
        monthly_stipend=1400.0,
        stipend_currency="EUR",
        travel_support=True,
        travel_allowance_amount=3000.0,
        accommodation_support=True,
        health_insurance=True,
        min_cgpa=3.2,
        grading_scale=4.0,
        min_ielts=6.5,
        min_toefl=90.0,
        eligible_nationalities=["All International Candidates", "Partner Countries", "Programme Countries"],
        work_experience_years_required=0.0,
        required_documents=[
            "Bachelor's Degree Certificate and Transcript of Records",
            "Curriculum Vitae",
            "Two Letters of Recommendation",
            "Statement of Purpose / Motivation Letter",
            "Proof of English Proficiency",
            "Passport Copy",
        ],
        application_steps=[
            "Consult the official EMJM Master Catalogue on the EU portal",
            "Select target joint degree program (study across at least 2 European countries)",
            "Submit directly through the consortium's online application system",
        ],
        application_open_date="2025-10-01",
        application_deadline="2026-01-15",
        status=OpportunityStatus.EXPIRED,
        status_reason="Verified deadline passed for 2026 cycle. Next cycle opens October 2026.",
        official_application_url="https://erasmus-plus.ec.europa.eu/opportunities/opportunities-for-individuals/students/erasmus-mundus-joint-masters",
        source_id=sources_data[1].id,
        overview="High-level integrated study programs jointly delivered by international consortiums of higher education institutions across Europe with comprehensive EU funding covering full participation costs and monthly allowances.",
    )
    db.add(sch2)

    sch3 = Scholarship(
        name="Swedish Institute Scholarships for Global Professionals (SISGP)",
        provider="Swedish Institute (Ministry for Foreign Affairs)",
        country="Sweden",
        university_id=None,
        degree_level=DegreeLevel.MASTERS,
        eligible_fields=["Computer Science", "Engineering", "Data Science", "Sustainability", "Public Health", "Business Analytics"],
        funding_type=FundingType.FULLY_FUNDED,
        tuition_coverage_pct=100.0,
        monthly_stipend=12000.0,
        stipend_currency="SEK",
        travel_support=True,
        travel_allowance_amount=15000.0,
        accommodation_support=True,
        health_insurance=True,
        min_cgpa=3.0,
        grading_scale=4.0,
        min_ielts=6.5,
        min_toefl=90.0,
        eligible_nationalities=["Bangladesh", "Bolivia", "Brazil", "Cambodia", "Cameroon", "Colombia", "Ecuador", "Egypt", "Ethiopia", "Gambia", "Georgia", "Ghana", "Guatemala", "Honduras", "India", "Indonesia", "Jordan", "Kenya", "Liberia", "Malawi", "Mexico", "Morocco", "Myanmar", "Nepal", "Nigeria", "Pakistan", "Peru", "Philippines", "Rwanda", "South Africa", "Sri Lanka", "Sudan", "Tanzania", "Tunisia", "Uganda", "Ukraine", "Vietnam", "Zambia", "Zimbabwe"],
        work_experience_years_required=1.5,
        required_documents=[
            "Curriculum Vitae on SI template",
            "Proof of Work & Leadership Experience on SI template",
            "Two Letters of Reference on SI template",
            "Copy of valid Passport",
        ],
        application_steps=[
            "Apply for eligible Master's programmes via University Admissions Sweden in October-January",
            "Receive application number",
            "Apply for SI scholarship in February during the dedicated portal opening",
        ],
        application_open_date="2026-02-10",
        application_deadline="2026-02-28",
        status=OpportunityStatus.EXPIRED,
        status_reason="Deadline passed for Autumn 2026. Next cycle opens February 2027.",
        official_application_url="https://si.se/en/apply/scholarships/swedish-institute-scholarships-for-global-professionals/",
        source_id=sources_data[2].id,
        overview="Funded by the Swedish Ministry for Foreign Affairs. Aims to develop future global leaders who will contribute to the United Nations 2030 Agenda for Sustainable Development.",
    )
    db.add(sch3)

    sch4 = Scholarship(
        name="ETH Zurich Excellence Scholarship & Opportunity Programme (ESOP)",
        provider="ETH Zurich Rectorate",
        country="Switzerland",
        university_id=eth.id,
        degree_level=DegreeLevel.MASTERS,
        eligible_fields=["Computer Science", "Robotics", "Data Science", "Electrical Engineering", "Physics", "Mathematics"],
        funding_type=FundingType.FULLY_FUNDED,
        tuition_coverage_pct=100.0,
        monthly_stipend=2000.0,
        stipend_currency="CHF",
        travel_support=True,
        travel_allowance_amount=1500.0,
        accommodation_support=True,
        health_insurance=True,
        min_cgpa=3.7,
        grading_scale=4.0,
        min_ielts=7.0,
        min_toefl=100.0,
        eligible_nationalities=["All International Candidates"],
        work_experience_years_required=0.0,
        required_documents=[
            "ESOP Pre-Proposal for Master's Thesis (max 3 pages)",
            "Two Academic Letters of Recommendation from Professors",
            "Official Transcripts with Grade Distribution Table",
            "GRE General Test Scores",
        ],
        application_steps=[
            "Submit online application for regular Master's program at ETH Zurich",
            "Upload thesis proposal and financial aid application in eApply portal",
            "Departmental evaluation committee interviews and awards ESOP grants in March",
        ],
        application_open_date="2026-11-01",
        application_deadline="2026-12-15",
        status=OpportunityStatus.UPCOMING,
        status_reason="Verified upcoming application cycle opens November 2026.",
        official_application_url="https://ethz.ch/students/en/studies/financial/scholarships/excellencescholarship.html",
        source_id=sources_data[3].id,
        overview="The ESOP supports students with an exceptional track record in their Bachelor's studies with CHF 12,000 per semester towards living and study expenses, plus tuition waiver.",
    )
    db.add(sch4)

    # 5. Default Demo / Admin User
    admin_user = User(
        email="admin@nextabroad.ai",
        hashed_password=get_password_hash("AdminNextAbroad2026!"),
        full_name="Platform Administrator",
        role="admin",
        is_active=True,
    )
    db.add(admin_user)

    student_user = User(
        email="student@nextabroad.ai",
        hashed_password=get_password_hash("StudentNextAbroad2026!"),
        full_name="Tanvir Rahman",
        role="student",
        is_active=True,
    )
    db.add(student_user)

    await db.commit()
