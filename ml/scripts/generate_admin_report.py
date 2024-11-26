import io
import pandas as pd
import matplotlib.pyplot as plt
import seaborn as sns
from reportlab.lib.pagesizes import letter
from reportlab.platypus import SimpleDocTemplate, Table, TableStyle, Paragraph, Spacer, Image, PageBreak
from reportlab.lib import colors
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.units import inch
from reportlab.lib.enums import TA_JUSTIFY, TA_CENTER, TA_LEFT
from datetime import datetime
import logging

# Set up modern styling for plots
plt.style.use('bmh')
sns.set_theme(style="whitegrid")

logger = logging.getLogger(__name__)

def analyze_consumption_data(most_expanded_df, start_datetime, end_datetime):
    """
    Enhanced data analysis with additional metrics
    """
    most_expanded_df['start_date'] = pd.to_datetime(
        most_expanded_df['Date Range'].str.split('-').str[0],
        format='%d/%m/%Y',
        errors='coerce'
    )

    if most_expanded_df['start_date'].isnull().any():
        logger.error("Invalid date entries detected")
        raise ValueError("Invalid date entries found")

    filtered_df = most_expanded_df[
        (most_expanded_df['start_date'].dt.date >= start_datetime.date()) &
        (most_expanded_df['start_date'].dt.date <= end_datetime.date())
    ]

    if filtered_df.empty:
        logger.warning(f"No data found between {start_datetime.date()} and {end_datetime.date()}")
        return {
            'total_consumption': pd.Series(),
            'top_dishes': pd.Series(),
            'meal_distribution_percent': pd.Series(),
            'weekly_trend': pd.Series(),
            'daily_avg': pd.Series(),
            'total_kg': 0,
            'growth_rate': 0
        }

    # Enhanced analytics
    total_consumption = filtered_df.groupby('Meal')['Quantity (kg)'].sum()
    top_dishes = filtered_df.groupby('Dish Name')['Quantity (kg)'].sum().nlargest(10)
    meal_distribution_percent = (total_consumption / total_consumption.sum()) * 100
    weekly_trend = filtered_df.groupby('Week')['Quantity (kg)'].sum()
    daily_avg = filtered_df.groupby(['Meal'])['Quantity (kg)'].mean()
    growth_rate = ((weekly_trend.iloc[-1] - weekly_trend.iloc[0]) / weekly_trend.iloc[0] * 100) if len(weekly_trend) > 1 else 0

    return {
        'total_consumption': total_consumption,
        'top_dishes': top_dishes,
        'meal_distribution_percent': meal_distribution_percent,
        'weekly_trend': weekly_trend,
        'daily_avg': daily_avg,
        'total_kg': total_consumption.sum(),
        'growth_rate': growth_rate
    }


def create_visualizations(analysis_data):
    """
    Create enhanced visualizations with proper spacing between charts
    """
    figures = []
    
    # Color palette
    colors_palette = sns.color_palette("husl", 10)
    
    fig1 = plt.figure(figsize=(10, 8))
    gs1 = fig1.add_gridspec(1, 2, hspace=0.4)
    
    # 1. Meal Distribution (Donut Chart)
    if not analysis_data['meal_distribution_percent'].empty:
        ax1 = fig1.add_subplot(gs1[0, 0])
        wedges, texts, autotexts = ax1.pie(
            analysis_data['meal_distribution_percent'],
            labels=analysis_data['meal_distribution_percent'].index,
            autopct='%1.1f%%',
            startangle=90,
            pctdistance=0.85,
            colors=sns.color_palette("Set3")
        )
        centre_circle = plt.Circle((0, 0), 0.70, fc='white')
        ax1.add_artist(centre_circle)
        ax1.set_title('Meal Type Distribution', pad=20, fontsize=12, fontweight='bold')
        
    # 2. Top Dishes (Horizontal Bar Chart)
    if not analysis_data['top_dishes'].empty:
        ax2 = fig1.add_subplot(gs1[0, 1])
        bars = ax2.barh(
            analysis_data['top_dishes'].index,
            analysis_data['top_dishes'].values,
            color=colors_palette
        )
        ax2.set_title('Top 10 Most Consumed Dishes', pad=20, fontsize=12, fontweight='bold')
        ax2.set_xlabel('Quantity (kg)')
        for bar in bars:
            width = bar.get_width()
            ax2.text(width, bar.get_y() + bar.get_height()/2,
                    f'{width:.1f}kg', ha='left', va='center', fontsize=8)
    
    plt.tight_layout()
    buf1 = io.BytesIO()
    plt.savefig(buf1, format='png', bbox_inches='tight', dpi=300, facecolor='white')
    buf1.seek(0)
    plt.close()
    figures.append(buf1)
    
    # Figure 2: Weekly Trend and Daily Average
    # Increase figure height to accommodate spacing
    fig2 = plt.figure(figsize=(10, 10))
    
    # Adjust gridspec with increased height_ratios and hspace
    gs2 = fig2.add_gridspec(2, 1, height_ratios=[1.2, 1], hspace=0.8)
    
    # 3. Weekly Trend with Moving Average
    if not analysis_data['weekly_trend'].empty:
        ax3 = fig2.add_subplot(gs2[0])
        
        weeks = analysis_data['weekly_trend'].index
        
        if len(weeks) > 8:
            rotation = 45
            ha = 'right'
        else:
            rotation = 0
            ha = 'center'
            
        # Plot actual values
        line1 = ax3.plot(range(len(weeks)), 
                        analysis_data['weekly_trend'].values,
                        marker='o', linestyle='-', color=colors_palette[2],
                        label='Weekly Consumption')[0]
                        
        # Calculate and plot moving average
        ma = analysis_data['weekly_trend'].rolling(window=2).mean()
        line2 = ax3.plot(range(len(weeks)), ma.values,
                        linestyle='--', color=colors_palette[3],
                        label='Moving Average (2 weeks)')[0]
        
        ax3.set_xticks(range(len(weeks)))
        ax3.set_xticklabels(weeks, rotation=rotation, ha=ha)
        
        ax3.set_title('Weekly Consumption Trend', pad=20, fontsize=12, fontweight='bold')
        ax3.set_xlabel('Week', labelpad=10)
        ax3.set_ylabel('Quantity (kg)', labelpad=10)
        
        # Adjust legend position
        ax3.legend(
            [line1, line2],
            ['Weekly Consumption', 'Moving Average (2 weeks)'],
            loc='upper center',
            bbox_to_anchor=(0.5, 1.25),
            ncol=2,
            frameon=True,
            fancybox=True,
            shadow=True
        )
        
        ax3.grid(True, linestyle='--', alpha=0.7)
        ax3.margins(x=0.05)
        
    # 4. Daily Average by Meal Type
    if not analysis_data['daily_avg'].empty:
        ax4 = fig2.add_subplot(gs2[1])
        bars = ax4.bar(
            analysis_data['daily_avg'].index,
            analysis_data['daily_avg'].values,
            color=colors_palette
        )
        ax4.set_title('Daily Average Consumption by Meal Type',
                    pad=20, fontsize=12, fontweight='bold')
        ax4.set_ylabel('Average Quantity (kg)', labelpad=10)
        
        for bar in bars:
            height = bar.get_height()
            ax4.text(bar.get_x() + bar.get_width()/2, height,
                    f'{height:.1f}kg', ha='center', va='bottom')

    # Adjust layout with proper spacing
    plt.tight_layout()
    
    # Fine-tune the spacing
    plt.subplots_adjust(
        top=0.88,      # Increased top margin for legend
        bottom=0.1,    # Slight bottom margin
        hspace=0.45    # Increased space between plots
    )
    
    buf2 = io.BytesIO()
    plt.savefig(buf2, format='png', bbox_inches='tight', dpi=300, facecolor='white')
    buf2.seek(0)
    plt.close()
    figures.append(buf2)
    
    return figures


def create_pdf(summary_df, most_expanded_df, start_datetime, end_datetime):
    """
    Generate an enhanced PDF report with properly sized images
    """
    try:
        # Analyze data
        analysis_data = analyze_consumption_data(most_expanded_df, start_datetime, end_datetime)
        
        # Create visualizations
        figure_buffers = create_visualizations(analysis_data)

        # PDF setup
        pdf_filename = f'consumption_report_{start_datetime.strftime("%d_%m_%Y")}_to_{end_datetime.strftime("%d_%m_%Y")}.pdf'
        doc = SimpleDocTemplate(
            pdf_filename,
            pagesize=letter,
            rightMargin=50,
            leftMargin=50,
            topMargin=50,
            bottomMargin=30
        )
        
        # Styles remain the same...
        styles = getSampleStyleSheet()
        title_style = ParagraphStyle(
            'CustomTitle',
            parent=styles['Title'],
            fontSize=24,
            leading=30,
            alignment=TA_CENTER,
            spaceAfter=30,
            textColor=colors.HexColor('#2C3E50'),
            fontName='Helvetica-Bold',
        )
        
        heading_style = ParagraphStyle(
            'CustomHeading',
            fontSize=16,
            leading=20,
            spaceBefore=15,
            spaceAfter=15,
            textColor=colors.HexColor('#34495E'),
            fontName='Helvetica-Bold',
        )
        
        subheading_style = ParagraphStyle(
            'CustomSubHeading',
            fontSize=14,
            leading=18,
            spaceBefore=10,
            spaceAfter=10,
            textColor=colors.HexColor('#7F8C8D'),
            fontName='Helvetica-Bold',
        )
        
        normal_style = ParagraphStyle(
            'CustomNormal',
            fontSize=11,
            leading=14,
            spaceBefore=8,
            spaceAfter=8,
            alignment=TA_JUSTIFY,
            textColor=colors.HexColor('#2C3E50'),
        )

        # Report content
        story = []
        
        # Title section
        story.append(Paragraph("Consumption Analysis Report", title_style))
        story.append(Paragraph(
            f"Period: {start_datetime.strftime('%d %B %Y')} to {end_datetime.strftime('%d %B %Y')}",
            subheading_style
        ))
        story.append(Spacer(1, 30))

        if analysis_data['total_kg'] > 0:
            # Key Metrics
            story.append(Paragraph("Key Metrics", heading_style))
            
            metrics_text = f"""
            <font color="#16A085"><b>Total Consumption:</b></font> {analysis_data['total_kg']:.2f} kg<br/>
            <font color="#16A085"><b>Growth Rate:</b></font> {analysis_data['growth_rate']:.1f}%<br/>
            <font color="#16A085"><b>Daily Average:</b></font> {analysis_data['daily_avg'].mean():.2f} kg<br/>
            """
            story.append(Paragraph(metrics_text, normal_style))
            story.append(Spacer(1, 20))
            
            # Add each visualization with proper sizing
            story.append(Paragraph("Visual Analysis", heading_style))
            story.append(Spacer(1, 15))
            
            # First set of visualizations
            story.append(Image(figure_buffers[0], width=7*inch, height=5.5*inch))
            story.append(PageBreak())
            
            # Second set of visualizations
            story.append(Image(figure_buffers[1], width=7*inch, height=5.5*inch))
            story.append(PageBreak())
            
            # Detailed Analysis
            story.append(Paragraph("Detailed Analysis", heading_style))
            
            # Top Dishes Table
            if not analysis_data['top_dishes'].empty:
                story.append(Paragraph("Top Consumed Dishes", subheading_style))
                table_data = [['Rank', 'Dish Name', 'Quantity (kg)']]
                for idx, (name, qty) in enumerate(analysis_data['top_dishes'].items(), 1):
                    table_data.append([str(idx), name, f"{qty:.2f}"])
                
                table = Table(table_data, colWidths=[0.7*inch, 4*inch, 1.3*inch])
                table.setStyle(TableStyle([
                    ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor('#34495E')),
                    ('TEXTCOLOR', (0, 0), (-1, 0), colors.white),
                    ('ALIGN', (0, 0), (-1, 0), 'CENTER'),
                    ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
                    ('FONTSIZE', (0, 0), (-1, 0), 12),
                    ('BOTTOMPADDING', (0, 0), (-1, 0), 12),
                    ('TOPPADDING', (0, 0), (-1, 0), 12),
                    ('BACKGROUND', (0, 1), (-1, -1), colors.white),
                    ('TEXTCOLOR', (0, 1), (-1, -1), colors.HexColor('#2C3E50')),
                    ('ALIGN', (0, 1), (0, -1), 'CENTER'),
                    ('ALIGN', (-1, 1), (-1, -1), 'RIGHT'),
                    ('FONTNAME', (0, 1), (-1, -1), 'Helvetica'),
                    ('FONTSIZE', (0, 1), (-1, -1), 10),
                    ('GRID', (0, 0), (-1, -1), 1, colors.HexColor('#BDC3C7')),
                    ('ROWBACKGROUNDS', (0, 1), (-1, -1), [colors.white, colors.HexColor('#F9F9F9')]),
                    ('BOTTOMPADDING', (0, 1), (-1, -1), 8),
                    ('TOPPADDING', (0, 1), (-1, -1), 8),
                ]))
                story.append(table)
            
            # Footer
            story.append(Spacer(1, 30))
            footer_text = (
                f"Report generated on: {datetime.now().strftime('%d %B %Y, %H:%M:%S')}<br/>"
                "For internal use only"
            )
            story.append(Paragraph(footer_text, normal_style))
        else:
            story.append(Paragraph(
                "No consumption data available for the selected period.",
                heading_style
            ))

        # Build the PDF
        doc.build(story)
        return pdf_filename

    except Exception as e:
        logger.error(f"Error creating PDF: {str(e)}")
        raise