package uk.ac.nactem.covid.barchart;

import org.apache.commons.text.StringEscapeUtils;
import org.apache.wicket.Component;
import org.apache.wicket.ajax.AjaxRequestTarget;
import org.apache.wicket.markup.head.IHeaderResponse;
import org.apache.wicket.markup.head.JavaScriptHeaderItem;
import org.apache.wicket.markup.head.OnLoadHeaderItem;
import org.apache.wicket.markup.html.WebMarkupContainer;
import org.apache.wicket.model.IModel;
import org.apache.wicket.request.resource.PackageResourceReference;
import uk.ac.nactem.wicket.ajax.attributes.CallbackParameter;
import uk.ac.nactem.wicket.html.vis.VisPanel;
import uk.ac.nactem.wicket.chart.ChartDataProvider;
import uk.ac.nactem.wicket.chart.DataItem;

/**
 *
 * @author sam
 */
public class BarChartPanel extends VisPanel {
    private String initScript;
    private Component chart;
    private Callback link;
    
    public BarChartPanel(String id, IModel<ChartDataProvider> model) {
        super(id, model);
    }

    @Override
    protected void onInitialize() {
        super.onInitialize();
        add(chart = new WebMarkupContainer("chart").setOutputMarkupId(true));
        chart.getMarkupId();
        link = new Callback(CallbackParameter.explicit("id")) {
            @Override
            public void respond(AjaxRequestTarget target) {
                if (hasParam("id")) {
                    BarChartPanel.this.onClick(target, getParam("id").toString().split(","));
                }
                else {
                    System.err.println("No ID!");
                }
            }
        };
        add(link);
    }
    
    @Override
    protected void onBeforeRender() {
        super.onBeforeRender();
        String dataS = "";
        ChartDataProvider data = (ChartDataProvider)getDefaultModelObject();
        for (DataItem b : data) {
            if (!dataS.isEmpty()) {
                dataS = dataS + ",";
            }
            dataS = dataS + String.format("{\"id\":\"%s\",\"year\":\"%s\",\"number\":%d,\"group\":\"%s\",\"title\":\"%s\"}",
                    b.getId(),
                    StringEscapeUtils.escapeJson(b.getLabel()),
                    b.getSize(),
                    StringEscapeUtils.escapeJson(b.getGroup()),
                    StringEscapeUtils.escapeJson(b.getTitle()));
        }
        dataS = "[" + dataS + "]";
        initScript = "var yrChart = new simpleYear.simpleYear('#" + chart.getMarkupId()+"', 300, 600,"+clickFunc()+", false, null);\n"+
        "yrChart.createSimpleYear("+dataS+", null, false);";
    }
        
    @Override
    public void renderHead(IHeaderResponse response) {
        PackageResourceReference jsFile =
                    new PackageResourceReference(BarChartPanel.class, "barchart2.js");
        JavaScriptHeaderItem jsItem = JavaScriptHeaderItem.forReference(jsFile);
        response.render(jsItem);
        response.render(OnLoadHeaderItem.forScript(initScript));
    }

    @Override
    protected CharSequence initScript() {
        return initScript;
    }
    
    protected void onClick(AjaxRequestTarget target, String[] id) {
        
    }
    
    private CharSequence clickFunc () {
        return link.getCallbackFunction((CallbackParameter[])null);
    }
}
